// server/routers/item/$id/edit.ts
import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item' // É necessário importar a entidade Item
import { ItemStatus, ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { z } from 'zod'
import { idOrNameSchema } from '../create'

export default new Router({
  name: 'Edit Item',
  path: '/item/:id',
  description: 'Update item information by ID. If the item belongs to a group, all items in the group will be updated.',
  authenticate: true,
  schema: {
    put: z.object({
      name: z.string().max(256).optional(),
      description: z.string().max(2048).optional(),
      location: z.string().max(256).optional(),
      price: z.number().positive().optional(),
      type: z.nativeEnum(ItemType).optional(),
      status: z.nativeEnum(ItemStatus).optional(),
      category: idOrNameSchema.optional(),
      tags: z.array(idOrNameSchema).optional(),
    })
  },
  methods: {
    async put({ reply, request, schema }) {
      const params = request.params as { id: string }
      const itemId = Number(params.id)
      
      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.VIEWER,
      })

      if (!item) {
        return reply.status(404).send({
          message: `Item with ID ${params.id} not found`
        })
      }

      if (!permission) {
        return reply.code(403).send({
          message: 'You do not have sufficient permission!'
        })
      }

      // Se o item não tiver um groupUuid, atualize apenas ele
      if (!item.groupUuid) {
        Object.assign(item, schema)
        const result = await item.save()

        return reply.code(200).send({
          message: 'Item updated successfully',
          data: result
        })
      }
      
      // Se houver um groupUuid, atualize todos os itens do grupo
      const updateResult = await Item.update({ groupUuid: item.groupUuid }, schema)

      // Se nenhum item foi afetado (o que seria inesperado aqui), retorne uma mensagem
      if (updateResult.affected === 0) {
        return reply.code(404).send({
          message: 'No items found for the group to update.',
        })
      }

      // Busque os itens atualizados para retorná-los na resposta
      const updatedItems = await Item.find({ where: { groupUuid: item.groupUuid } })

      return reply.code(200).send({
        message: `Successfully updated ${updatedItems.length} items in the group.`,
        data: updatedItems,
        metadata: {
          total: updatedItems.length,
          currentPage: 1,
          totalPages: 1,
          pageSize: 1
        }
      })
    }
  }
})