import { repository } from '@/database'
import { paginateSchema, paginateStringQuery } from '@/database/pagination'
import { Method } from '@asterflow/router'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1, 'Nome da tag é obrigatório')
})

export default new Method({
  name: 'Tags',
  description: 'Operações de listagem e criação de tags',
  param: `?${paginateStringQuery}`,
  method: 'get',
  // authenticate: true,
  schema: tagSchema,
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
      const [tags, total] = await repository.tag.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: { name: 'ASC' },
      })

      return response.code(200).send({
        message: 'Tags recuperadas com sucesso',
        data: tags,
        metadata: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / pageSize),
          pageSize,
        },
      })
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
      return response.code(500).send({ message: 'Erro interno do servidor' })
    }
  }
})