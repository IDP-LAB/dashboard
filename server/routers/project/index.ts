import { repository } from '@/database'
import { paginate, paginateStringQuery } from '@/database/pagination'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'ListProjects',
  description: 'Return Array Projects',
  param: `?${paginateStringQuery}`,
  method: 'get',
  // authenticate: true,
  handler: async ({ response, url }) => {
    const query = url.getSearchParams()
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 1)
    const interval = ['month', 'day', 'hour', 'none'].includes(query.interval ?? '') ? query.interval as string : 'none'

    const paginated = await paginate({
      repository: repository.project,
      page,
      interval: interval as 'day' | 'none' | 'month' | 'hour',
      pageSize
    })

    return response.code(200).send({
      message: 'Projects retrieved successfully',
      ...paginated
    })
  }
})