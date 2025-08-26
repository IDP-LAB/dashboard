import { Invite } from '@/database/entity/Invite'
import { paginateSchema, paginateStringQuery } from '@/database/pagination'
import { Method } from '@asterflow/router'
import z from 'zod'

const listInvitesQuerySchema = paginateSchema.extend({
  search: z.string().optional()
})

export default new Method({
  name: 'Invites',
  description: 'Lista convites com paginação (apenas administradores)'.trim(),
  method: 'get',
  param: `?search&${paginateStringQuery}`,
  // authenticate: [Role.Administrator],
  handler: async ({ response, url }) => {
    const query = url.getSearchParams()
    const validation = listInvitesQuerySchema.safeParse(query)
    if (!validation.success) {
      return response.code(400).send({ message: 'Parâmetros de consulta inválidos.', error: validation.error })
    }

    const { page, pageSize, search } = validation.data

    try {
      const where = search
        ? [
          // busca simples por código exato
          { code: search },
        ]
        : undefined

      const [invites, total] = await Invite.findAndCount({
        where,
        relations: { users: true },
        order: { createdAt: 'DESC' as never },
        skip: (page - 1) * pageSize,
        take: pageSize
      })

      return response.code(200).send({
        message: 'Convites recuperados com sucesso',
        data: invites,
        metadata: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / pageSize),
          pageSize
        }
      })
    } catch (error) {
         
      console.error('Erro ao listar convites:', error)
      return response.code(500).send({ message: 'Erro interno do servidor ao listar convites' })
    }
  }
})
