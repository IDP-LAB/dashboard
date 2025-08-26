import { repository } from '@/database'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Categories',
  path: '/category/:id=number',
  method: 'put',
  description: 'CRUD operations for item categories',
  // authenticate: true,
  schema: z.object({
    name: z.string().min(1, 'Nome da categoria é obrigatório')
  }),
  handler: async ({ response, schema, url }) => {
    const categoryId = url.getParams().id

    if (isNaN(categoryId)) {
      return response.code(400).send({
        message: 'ID da categoria deve ser um número válido'
      })
    }

    try {
      const category = await repository.itemCategory.findOne({
        where: { id: categoryId }
      })

      if (!category) {
        return response.code(404).send({
          message: 'Categoria não encontrada'
        })
      }

      // Verificar se novo nome já existe em outra categoria
      const existingCategory = await repository.itemCategory.findOne({
        where: { name: schema.name }
      })

      if (existingCategory && existingCategory.id !== categoryId) {
        return response.code(409).send({
          message: 'Categoria com este nome já existe'
        })
      }

      category.name = schema.name
      const savedCategory = await category.save()

      return response.code(200).send({
        message: 'Categoria atualizada com sucesso',
        data: savedCategory
      })
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor'
      })
    }
  }
}) 