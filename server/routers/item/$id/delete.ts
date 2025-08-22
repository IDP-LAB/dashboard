import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item'
import { File } from '@/database/entity/File'
import { Log } from '@/database'
import { ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { storage } from '@/index'
import { z } from 'zod'

export default new Router({
  name: 'Delete Item',
  path: '/item/:id',
  description: 'Delete individual item by ID.',
  authenticate: true,
  schema: {
    delete: z.object({
      returnProducts: z.boolean()
    }).default({ returnProducts: false })
  },
  methods: {
    async delete({ reply, request, schema }) {
      const params = request.params as { id: string }
      const itemId = parseInt(params.id)
      
      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.DELETE
      })

      if (!permission) return reply.code(403).send({
        message: 'Você não tem permissão suficiente!'
      })

      if (!item) return reply.status(404).send({
        message: `Item com ID ${params.id} não encontrado`
      })

      if (item.type !== ItemType.Consumable && request.user.role !== Role.Administrator) {
        return reply.status(403).send({
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

        return reply.code(200).send({
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
        return reply.code(500).send({
          message: 'Erro interno do servidor ao deletar item'
        })
      }
    }
  }
}) 