import { Log } from '@/database'
import { Item } from '@/database/entity/Item'
import { ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Delete Item',
  path: '/item/:id=number',
  description: 'Delete individual item by ID.',
  method: 'delete',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const itemId = url.getParams().id
      
    const [permission, item] = await hasItemPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      itemId,
      requiredPermission: PERMISSIONS.DELETE
    })

    if (!permission) return response.code(403).send({
      message: 'Você não tem permissão suficiente!'
    })

    if (!item) return response.status(404).send({
      message: `Item com ID ${itemId} não encontrado`
    })

    if (item.type !== ItemType.Consumable && request.user.role !== Role.Administrator) {
      return response.status(403).send({
        message: 'Apenas administradores podem deletar itens de equipamento.'
      })
    }

    try {
      // Deletar apenas o item individual
      const deletedSnapshot = { id: item.id, name: item.name, groupId: item.group?.id }
      await Item.remove([item])

      await Log.create({
        code: 'item:deleted',
        data: { id: deletedSnapshot.id, name: deletedSnapshot.name, group: String(deletedSnapshot.groupId ?? ''), ownerId: request.user.id },
        user: { id: request.user.id }
      }).save()

      return response.code(200).send({
        message: `Item "${item.name}" deletado com sucesso`,
        data: {
          deletedItems: 1,
          deletedFiles: 0,
          item: {
            id: item.id,
            name: item.name,
            status: item.status
          }
        }
      })
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao deletar item'
      })
    }
  }
}) 