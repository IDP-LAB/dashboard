import { Router } from '@/controllers/router'
import { ProjectStatus, Role } from '@/database/enums'
import { Log } from '@/database'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { z } from 'zod'

export default new Router({
  name: 'Edit Project',
  path: '/project/:id',
  description: 'Update project information by ID',
  authenticate: true,
  schema: {
    put: z.object({
      name: z.string().min(4).max(64).optional(),
      status: z.nativeEnum(ProjectStatus).optional()
    })
  },
  methods: {
    async put({ reply, request, schema }) {
      const params = request.params as { id: string }
      const projectId = Number(params.id)
      const [permission, project] = await hasProjectPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        projectId,
        requiredPermission: PERMISSIONS.EDITOR,
      })

      if (!permission) {
        return reply.code(403).send({
          message: 'You do not have sufficient permission!'
        })
      }

      if (!project) {
        return reply.status(404).send({
          message: `Project with ID ${params.id} not found`
        })
      }

      if (schema.name) project.name = schema.name
      if (schema.status) project.status = schema.status

      const result = await project.save()

      await Log.create({
        code: 'project:updated',
        data: { id: result.id, ownerId: request.user.id, name: result.name },
        user: { id: request.user.id }
      }).save()

      return reply.code(200).send({
        message: 'User updated successfully',
        data: result
      })
    }
  }
}) 