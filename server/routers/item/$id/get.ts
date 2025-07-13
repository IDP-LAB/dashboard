import { Router } from '@/controllers/router'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'

export default new Router({
  name: 'Get Item',
  path: '/item/:id',
  description: 'Get item information by ID',
  authenticate: true,
  methods: {
    async get({ reply, request }) {
      const params = request.params as { id: string }
      const itemId = Number(params.id)
      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.VIEWER,
      })

      if (!permission) return reply.code(403).send({
        message: 'You do not have sufficient permission!'
      })

      if (!item) return reply.status(404).send({
        message: `Item with ID ${params.id} not found`
      })

      return reply.code(200).send({
        message: 'Item details retrieved successfully',
        data: item
      })
    }
  }
}) 