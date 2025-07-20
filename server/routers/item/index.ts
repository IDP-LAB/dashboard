import { Router } from '@/controllers/router'
import { repository } from '@/database'
import { paginate, paginateQuery, paginateSchema } from '@/database/pagination'
import { In } from 'typeorm'
import { z } from 'zod'

const listItemsQuerySchema = paginateSchema.extend({
  groupBy: z.enum(['groupUuid']).optional()
})

export default new Router({
  name: 'ListItems',
  description: 'Retorna um array de itens. Pode ser agrupado por groupUuid.',
  authenticate: true,
  query: {
    get: [...paginateQuery, 'groupBy']
  },
  methods: {
    async get({ reply, query }) {
      // Validação dos parâmetros da query usando o schema estendido
      const validation = listItemsQuerySchema.safeParse(query)
      if (!validation.success) {
        return reply.code(400).send({ message: 'Parâmetros de consulta inválidos.', error: validation.error })
      }
      
      const { page, pageSize, groupBy, interval } = validation.data

      if (groupBy === 'groupUuid') {
        const qb = repository.item.createQueryBuilder('item')
          .select('item.groupUuid', 'groupUuid')
          .addSelect('COUNT(item.id)', 'quantity')
          .addSelect('MIN(item.id)', 'representativeId')
          .groupBy('item.groupUuid')

        const totalGroupsResult = await qb.clone().select('COUNT(DISTINCT item.groupUuid)', 'count').getRawOne()
        const totalItems = parseInt(totalGroupsResult?.count ?? '0', 10)

        const groupedItems = await qb
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .getRawMany()

        if (groupedItems.length === 0) {
          return reply.code(200).send({
            message: 'Nenhum grupo de itens encontrado.',
            data: [],
            metadata: { total: 0, currentPage: page, totalPages: 0, pageSize }
          })
        }

        const representativeIds = groupedItems.map(g => g.representativeId)
        const quantityMap = new Map<string, number>(groupedItems.map(g => [g.groupUuid, parseInt(g.quantity, 10)]))

        const representativeItems = await repository.item.find({
          where: { id: In(representativeIds) },
          relations: ['category', 'tags']
        })

        const data = representativeItems.map(item => ({
          ...item,
          quantity: quantityMap.get(item.groupUuid) || 0
        })).sort((a, b) => a.id - b.id) // Garante uma ordem consistente

        return reply.code(200).send({
          message: 'Itens agrupados retornados com sucesso.',
          data,
          metadata: {
            total: totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / pageSize),
            pageSize
          }
        })
      }

      // Lógica original de paginação (sem agrupamento)
      const paginated = await paginate({
        repository: repository.item,
        page,
        interval,
        pageSize
      })

      return reply.code(200).send({
        message: 'Itens retornados com sucesso.',
        ...paginated
      })
    }
  }
})