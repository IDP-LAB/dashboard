import { Router } from '@/controllers/router'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'

export default new Router({
  name: 'Get Project',
  path: '/project/:id',
  description: 'Get project information by ID',
  authenticate: true,
  methods: {
    async get({ reply, request }) {
      const params = request.params as { id: string }
      const projectId = Number(params.id)
      const [permission, project] = await hasProjectPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        projectId,
        requiredPermission: PERMISSIONS.VIEWER,
      })

      if (!permission) return reply.code(403).send({
        message: 'You do not have sufficient permission!'
      })

      if (!project) return reply.status(404).send({
        message: `User with ID ${params.id} not found`
      })

      return reply.code(200).send({
        message: 'User details retrieved successfully',
        data: project,
      })
    }
  }
}) 