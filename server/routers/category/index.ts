import { Router } from '@/controllers/router'
import { repository } from '@/database'
import { ItemCategory } from '@/database/entity/ItemCategory'
import { paginate, paginateQuery, paginateSchema } from '@/database/pagination'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório')
})

const listCategoriesQuerySchema = paginateSchema

export default new Router({
  name: 'Categories',
  description: 'CRUD operations for item categories',
  authenticate: true,
  query: {
    get: paginateQuery
  },
  schema: {
    post: categorySchema,
    put: categorySchema
  },
  methods: {
    // Listar categorias
    async get({ reply, query }) {
      const validation = listCategoriesQuerySchema.safeParse(query)
      if (!validation.success) {
        return reply.code(400).send({ 
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

        return reply.code(200).send({
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
        return reply.code(500).send({
          message: 'Erro interno do servidor'
        })
      }
    },

    // Criar nova categoria
    async post({ reply, schema }) {
      try {
        // Verificar se categoria já existe
        const existingCategory = await repository.itemCategory.findOne({
          where: { name: schema.name }
        })

        if (existingCategory) {
          return reply.code(409).send({
            message: 'Categoria com este nome já existe'
          })
        }

        const category = ItemCategory.create({
          name: schema.name
        })

        const savedCategory = await category.save()

        return reply.code(201).send({
          message: 'Categoria criada com sucesso',
          data: savedCategory
        })
      } catch (error) {
        console.error('Erro ao criar categoria:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor'
        })
      }
    },

    // Editar categoria
    async put({ reply, request, schema }) {
      const params = request.params as { id: string }
      const categoryId = parseInt(params.id)

      if (isNaN(categoryId)) {
        return reply.code(400).send({
          message: 'ID da categoria deve ser um número válido'
        })
      }

      try {
        const category = await repository.itemCategory.findOne({
          where: { id: categoryId }
        })

        if (!category) {
          return reply.code(404).send({
            message: 'Categoria não encontrada'
          })
        }

        // Verificar se novo nome já existe em outra categoria
        const existingCategory = await repository.itemCategory.findOne({
          where: { name: schema.name }
        })

        if (existingCategory && existingCategory.id !== categoryId) {
          return reply.code(409).send({
            message: 'Categoria com este nome já existe'
          })
        }

        category.name = schema.name
        const savedCategory = await category.save()

        return reply.code(200).send({
          message: 'Categoria atualizada com sucesso',
          data: savedCategory
        })
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor'
        })
      }
    },

    // Deletar categoria
    async delete({ reply, request }) {
      const params = request.params as { id: string }
      const categoryId = parseInt(params.id)

      if (isNaN(categoryId)) {
        return reply.code(400).send({
          message: 'ID da categoria deve ser um número válido'
        })
      }

      try {
        const category = await repository.itemCategory.findOne({
          where: { id: categoryId },
          relations: ['groups']
        })

        if (!category) {
          return reply.code(404).send({
            message: 'Categoria não encontrada'
          })
        }

        // Verificar se há grupos associados à categoria
        if (category.groups && category.groups.length > 0) {
          return reply.code(400).send({
            message: `Não é possível deletar categoria. Existem ${category.groups.length} grupo(s) associado(s).`
          })
        }

        await category.remove()

        return reply.code(200).send({
          message: 'Categoria deletada com sucesso',
          data: null
        })
      } catch (error) {
        console.error('Erro ao deletar categoria:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor'
        })
      }
    }
  }
}) 