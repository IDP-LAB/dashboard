import { repository } from '@/database'
import { paginateSchema, paginateStringQuery } from '@/database/pagination'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Categories',
  path: `/category?${paginateStringQuery}`,
  description: 'CRUD operations for item categories',
  method: 'get',
  // authenticate: true,
  handler: async ({ response, url }) => {
    const query = url.getSearchParams()
    const validation = paginateSchema.safeParse(query)
    if (!validation.success) {
      return response.code(400).send({ 
        message: 'Parâmetros de consulta inválidos.', 
        error: validation.error 
      })
    }

    const { page, pageSize } = validation.data

    try {
      const [categories, total] = await repository.itemCategory.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { name: 'ASC' }
      })

      return response.code(200).send({
        message: 'Categorias recuperadas com sucesso',
        data: categories,
        metadata: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / pageSize),
          pageSize
        }
      })
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor'
      })
    }
  }
}) 