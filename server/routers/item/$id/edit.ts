import { Router } from '@/controllers/router'
import { ItemStatus, ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { z } from 'zod'

export default new Router({
  name: 'Edit Item',
  path: '/item/:id',
  description: 'Update item information by ID',
  authenticate: true,
  schema: {
    put: z.object({
      name: z.string().min(4).max(64).optional(),
      type: z.nativeEnum(ItemType).optional(),
      status: z.nativeEnum(ItemStatus).optional()
    })
  },
  methods: {
    async put({ reply, request, schema }) {
      const params = request.params as { id: string }
      const itemId = Number(params.id)

      console.log(request.user)

      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.VIEWER,
      })

      if (!item) return reply.status(404).send({
        message: `Item with ID ${params.id} not found`
      })

      if (!permission) return reply.code(403).send({
        message: 'You do not have sufficient permission!'
      })

      if (schema.name) item.name = schema.name
      if (schema.type) item.type = schema.type
      if (schema.status) item.status = schema.status

      const result = await item.save()

      return reply.code(200).send({
        message: 'User updated successfully',
        data: result
      })
    }
  }
}) 