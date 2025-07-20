import { Router } from '@/controllers/router'
import { ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { z } from 'zod'

export default new Router({
  name: 'Delete Item',
  path: '/item/:id',
  description: 'Delete item by ID',
  authenticate: true,
  schema: {
    delete: z.object({
      returnProducts: z.boolean()
    }).default({ returnProducts: false })
  },
  methods: {
    async delete({ reply, request }) {
      const params = request.params as { id: string }
      const itemId = parseInt(params.id)
      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.DELETE
      })

      if (!permission) return reply.code(403).send({
        message: 'You do not have sufficient permission!'
      })

      if (!item) return reply.status(404).send({
        message: `Item with ID ${params.id} not found`
      })

      if (item.type !== ItemType.Consumable && request.user.role !== Role.Administrator) {
        return reply.status(404).send({
          message: 'Only administrators can delete equipment items.'
        })
      }
      
      await item.remove()

      return reply.code(200).send({
        message: 'Item deleted successfully',
        data: item
      })
    }
  }
}) 