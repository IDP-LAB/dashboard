import { repository } from '@/database'
import { paginate, paginateStringQuery } from '@/database/pagination'
import { Method } from '@asterflow/router'
import { ILike } from 'typeorm'

export default new Method({
  name: 'List Users',
  description: 'Retrieve paginated list of users with access restricted to administrators and HR',
  method: 'get',
  // authenticate: [Role.Administrator],
  param: `?q&role&${paginateStringQuery}`,
  handler: async ({ response, url }) => {
    const query = url.getSearchParams()
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 1)
    const interval = ['month', 'day', 'hour', 'none'].includes(query.interval ?? '') ? query.interval as string : 'none'
    const q = typeof query.q === 'string' ? query.q.trim() : ''
    const roleParam = typeof query.role === 'string' ? query.role.trim().toLowerCase() : ''
    const roleFilter = ['administrator', 'teacher', 'student'].includes(roleParam) ? roleParam : undefined

    // Estatísticas globais por role (independente de paginação/filtro)
    const roleAgg = await repository.user.createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(1)', 'count')
      .groupBy('user.role')
      .getRawMany<{ role: string; count: string }>()
    const roleToCount = Object.fromEntries(roleAgg.map(r => [r.role, Number(r.count)])) as Record<string, number>
    const totalUsers = Object.values(roleToCount).reduce((a, b) => a + b, 0)

    if (q.length > 0) {
      const [items, total] = await repository.user.findAndCount({
        where: roleFilter
          ? [
            { name: ILike(`%${q}%`), role: roleFilter as any },
            { username: ILike(`%${q}%`), role: roleFilter as any }
          ]
          : [
            { name: ILike(`%${q}%`) },
            { username: ILike(`%${q}%`) }
          ],
        select: {
          id: true,
          name: true,
          username: true,
        },
        order: { name: 'ASC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })

      return response.code(200).send({
        message: 'Users retrieved successfully',
        data: {
          items,
          roles: {
            administrator: roleToCount['administrator'] ?? 0,
            teacher: roleToCount['teacher'] ?? 0,
            student: roleToCount['student'] ?? 0,
            total: totalUsers,
          }
        },
        metadata: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / pageSize),
          pageSize,
        }
      })
    }

    const paginated = await paginate({
      repository: repository.user,
      page,
      interval: interval as 'day' | 'none' | 'month' | 'hour',
      pageSize,
      relations: {
        auths: false
      },
      ...(roleFilter ? { role: roleFilter as any } : {})
    })

    return response.code(200).send({
      message: 'Users retrieved successfully',
      data: {
        items: paginated.data,
        roles: {
          administrator: roleToCount['administrator'] ?? 0,
          teacher: roleToCount['teacher'] ?? 0,
          student: roleToCount['student'] ?? 0,
          total: totalUsers,
        }
      },
      metadata: paginated.metadata
    })
  },
})