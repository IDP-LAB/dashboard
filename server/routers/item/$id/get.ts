import { Item } from '@/database/entity/Item'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Get Item',
  path: '/item/:id=number',
  description: 'Get individual item information by ID.',
  method: 'get',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const itemId = url.getParams().id
    const [permission, item] = await hasItemPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      itemId,
      requiredPermission: PERMISSIONS.VIEWER,
    })
      
    if (!item) return response.status(404).send({
      message: `Item com ID ${itemId} não encontrado`
    })

    if (!permission) return response.code(403).send({
      message: 'Você não tem permissão suficiente!'
    })

    try {
      // Recarregar o item com relações para exibição completa
      const fullItem = await Item.findOne({
        where: { id: item.id },
        relations: {
          group: { category: true, tags: true },
          project: { owner: true, memberships: { user: true } },
          movements: { project: true, user: true },
        },
      })

      return response.code(200).send({
        message: 'Detalhes do item recuperados com sucesso',
        data: fullItem ?? item
      })
    } catch (error) {
      console.error('Erro ao buscar item:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao buscar item'
      })
    }
  }
}) 