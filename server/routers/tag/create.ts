import { repository } from '@/database'
import { ItemTag } from '@/database/entity/ItemTag'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Tags',
  path: '/users',
  description: 'Operações de listagem e criação de tags',
  method: 'post',
  // authenticate: true,
  schema: z.object({
    name: z.string().min(1, 'Nome da tag é obrigatório')
  }),
  handler: async ({ response, schema }) => {
    try {
      const exists = await repository.tag.findOne({ where: { name: schema.name } })
      if (exists) return response.code(409).send({
        message: 'Tag com este nome já existe'
      })

      const tag = ItemTag.create({ name: schema.name })
      const saved = await tag.save()

      return response.code(201).send({
        message: 'Tag criada com sucesso',
        data: saved,
      })
    } catch (error) {
      console.error('Erro ao criar tag:', error)
      return response.code(500).send({ message: 'Erro interno do servidor' })
    }
  }
})


