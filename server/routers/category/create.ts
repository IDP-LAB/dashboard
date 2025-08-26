import { repository } from '@/database'
import { ItemCategory } from '@/database/entity/ItemCategory'
import { Method } from '@asterflow/router'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório')
})

export default new Method({
  name: 'Categories',
  description: 'CRUD operations for item categories',
  method: 'post',
  // authenticate: true,
  schema: categorySchema,
  handler: async ({ response, schema }) => {
    try {
      // Verificar se categoria já existe
      const existingCategory = await repository.itemCategory.findOne({
        where: { name: schema.name }
      })

      if (existingCategory) return response.code(409).send({
        message: 'Categoria com este nome já existe'
      })

      const category = await ItemCategory.create({ name: schema.name }).save()

      return response.code(201).send({
        message: 'Categoria criada com sucesso',
        data: category
      })
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor'
      })
    }
  }
}) 