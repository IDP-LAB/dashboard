import { Router } from '@/controllers/router'
import { repository } from '@/database/index'
import { paginate, paginateQuery } from '@/database/pagination'

export default new Router({
  name: 'List Products',
  description: 'Retrieve paginated list of products with tags and relations',
  authenticate: true,
  query: {
    get: paginateQuery
  },
  methods: {
    async get({ reply, query }) {
      try {
        const page = Math.max(1, Number(query.page) || 1)
        const pageSize = Math.max(1, Math.min(Number(query.pageSize) || 10, 100))
        const interval = ['month', 'day', 'hour', 'none'].includes(query.interval ?? '') 
          ? query.interval as string 
          : 'none'

        const paginated = await paginate({
          repository: repository.product,
          page,
          interval: interval as 'day' | 'none' | 'month' | 'hour',
          pageSize,
          relations: {
            tags: true,
            type: true,
            project: true
          },
          order: {
            createAt: 'DESC'
          }
        })

        // Formatar dados para resposta
        const formattedData = paginated.data.map(product => ({
          id: product.id,
          name: product.name,
          location: product.location,
          quantity: product.quantity,
          image: product.image,
          barcode: product.barcode,
          tags: product.tags.map(tag => ({
            id: tag.id,
            name: tag.name
          })),
          type: {
            id: product.type.id,
            name: product.type.name
          },
          project: {
            id: product.project.id,
            name: product.project.name
          },
          createdAt: product.createAt,
          updatedAt: product.updateAt
        }))

        return reply.code(200).send({
          message: 'Produtos recuperados com sucesso',
          data: formattedData,
          metadata: paginated.metadata
        })
        
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        
        return reply.status(500).send({
          message: 'Erro interno do servidor ao buscar produtos',
          error: process.env.NODE_ENV === 'development' ? error : undefined
        })
      }
    }
  }
}) 