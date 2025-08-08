import { Router } from '@/controllers/router'
import { repository } from '@/database'
import { ItemTag } from '@/database/entity/ItemTag'
import { paginateSchema, paginateQuery } from '@/database/pagination'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1, 'Nome da tag é obrigatório')
})

const listTagsQuerySchema = paginateSchema

export default new Router({
  name: 'Tags',
  description: 'Operações de listagem e criação de tags',
  authenticate: true,
  query: {
    get: paginateQuery,
  },
  schema: {
    post: tagSchema,
  },
  methods: {
    async get({ reply, query }) {
      const validation = listTagsQuerySchema.safeParse(query)
      if (!validation.success) {
        return reply.code(400).send({
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

        return reply.code(200).send({
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
        return reply.code(500).send({ message: 'Erro interno do servidor' })
      }
    },

    async post({ reply, schema }) {
      try {
        const exists = await repository.tag.findOne({ where: { name: schema.name } })
        if (exists) {
          return reply.code(409).send({ message: 'Tag com este nome já existe' })
        }

        const tag = ItemTag.create({ name: schema.name })
        const saved = await tag.save()

        return reply.code(201).send({
          message: 'Tag criada com sucesso',
          data: saved,
        })
      } catch (error) {
        console.error('Erro ao criar tag:', error)
        return reply.code(500).send({ message: 'Erro interno do servidor' })
      }
    }
  }
})


