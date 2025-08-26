import { repository } from '@/database'
import { Method } from '@asterflow/router'


export default new Method({
  name: 'Categories',
  description: 'CRUD operations for item categories',
  path: '/category/:id=number',
  method: 'delete',
  // authenticate: true,
  handler: async ({ response, url }) => {
    const categoryId = url.getParams().id

    if (isNaN(categoryId)) return response.code(400).send({
      message: 'ID da categoria deve ser um número válido'
    })

    try {
      const category = await repository.itemCategory.findOne({
        where: { id: categoryId },
        relations: ['groups']
      })

      if (!category) return response.code(404).send({
        message: 'Categoria não encontrada'
      })

      // Verificar se há grupos associados à categoria
      if (category.groups && category.groups.length > 0) {
        return response.code(400).send({
          message: `Não é possível deletar categoria. Existem ${category.groups.length} grupo(s) associado(s).`
        })
      }

      await category.remove()

      return response.code(200).send({
        message: 'Categoria deletada com sucesso',
        data: null
      })
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor'
      })
    }
  }
}) 