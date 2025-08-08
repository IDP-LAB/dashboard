import { Router } from '@/controllers/router'
import { repository } from '@/database'
import { paginate, paginateQuery, paginateSchema } from '@/database/pagination'
import { In } from 'typeorm'
import { z } from 'zod'

const listItemsQuerySchema = paginateSchema.extend({
  groupBy: z.enum(['groupUuid']).optional(),
  search: z.string().optional()
})

export default new Router({
  name: 'ListItems',
  description: 'Retorna um array de itens. Pode ser agrupado por group (UUID).',
  authenticate: true,
  query: {
    get: [...paginateQuery, 'groupBy', 'search']
  },
  methods: {
    async get({ reply, query }) {
      // Validação dos parâmetros da query usando o schema estendido
      const validation = listItemsQuerySchema.safeParse(query)
      if (!validation.success) {
        return reply.code(400).send({ message: 'Parâmetros de consulta inválidos.', error: validation.error })
      }
      
      const { page, pageSize, groupBy, interval, search } = validation.data

      if (groupBy === 'groupUuid') {
        let qb = repository.item.createQueryBuilder('item')
          .innerJoin('item.group', 'group')
          .select('group.id', 'groupUuid')
          .addSelect('COUNT(item.id)', 'quantity')
          .addSelect('MIN(item.id)', 'representativeId')

        // Aplicar filtro de busca se fornecido
        if (search) {
          qb = qb.where('item.name LIKE :search OR item.description LIKE :search', {
            search: `%${search}%`
          })
        }

        qb = qb.groupBy('group.id')

        // Contar total de grupos (após filtro de busca)
        // Usar uma subquery para contar grupos distintos corretamente
        const countQb = repository.item.createQueryBuilder('item')
          .innerJoin('item.group', 'group')
          .select('COUNT(DISTINCT group.id)', 'count')
        
        if (search) {
          countQb.where('item.name LIKE :search OR item.description LIKE :search', {
            search: `%${search}%`
          })
        }

        const totalGroupsResult = await countQb.getRawOne()
        const totalGroups = parseInt(totalGroupsResult?.count ?? '0', 10)

        // Buscar grupos paginados
        const groupedItems = await qb
          .orderBy('MIN(item.id)', 'ASC') // Ordenação consistente
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .getRawMany()

        if (groupedItems.length === 0) {
          return reply.code(200).send({
            message: 'Nenhum grupo de itens encontrado.',
            data: [],
            metadata: { 
              total: totalGroups, 
              currentPage: page, 
              totalPages: Math.ceil(totalGroups / pageSize), 
              pageSize 
            }
          })
        }

        const representativeIds = groupedItems.map(g => parseInt(g.representativeId, 10))
        const quantityMap = new Map<string, number>(
          groupedItems.map(g => [g.groupUuid, parseInt(g.quantity, 10)])
        )

        // Buscar itens representativos com suas relações
        const representativeItems = await repository.item.find({
          where: { id: In(representativeIds) },
          relations: { group: { category: true, tags: true } },
          order: { id: 'ASC' }
        })

        const data = representativeItems.map(item => ({
          ...item,
          // Compatibilidade: expor groupUuid no payload
          groupUuid: item.group?.id,
          // Compatibilidade: expor category/tags a partir do grupo
          category: (item.group )?.category ?? null,
          tags: (item.group )?.tags ?? [],
          quantity: quantityMap.get(item.group?.id ?? '') || 0
        }))

        return reply.code(200).send({
          message: 'Itens agrupados retornados com sucesso.',
          data,
          metadata: {
            total: totalGroups,
            currentPage: page,
            totalPages: Math.ceil(totalGroups / pageSize),
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