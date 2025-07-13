import { Router } from '@/controllers/router'
import { repository } from '@/database'
import { paginate, paginateQuery } from '@/database/pagination'

export default new Router({
  name: 'ListProjects',
  description: 'Return Array Projects',
  authenticate: true,
  query: {
    get: paginateQuery
  },
  methods: {
    async get({ reply, query }) {
      const page = Math.max(1, Number(query.page) || 1)
      const pageSize = Math.max(1, Number(query.pageSize) || 1)
      const interval = ['month', 'day', 'hour', 'none'].includes(query.interval ?? '') ? query.interval as string : 'none'

      const paginated = await paginate({
        repository: repository.project,
        page,
        interval: interval as 'day' | 'none' | 'month' | 'hour',
        pageSize
      })

      return reply.code(200).send({
        message: 'Projects retrieved successfully',
        ...paginated
      })
    }
  }
})