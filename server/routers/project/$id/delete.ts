import { Router } from '@/controllers/router'
import { Role } from '@/database/enums'
import { Log } from '@/database'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { z } from 'zod'

export default new Router({
  name: 'Delete Project',
  path: '/project/:id',
  description: 'Delete project by ID',
  authenticate: true,
  schema: {
    delete: z.object({
      returnProducts: z.boolean()
    }).default({ returnProducts: false })
  },
  methods: {
    async delete({ reply, request, schema }) {
      const params = request.params as { id: string }
      const projectId = parseInt(params.id)
      const [permission, project] = await hasProjectPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        projectId,
        requiredPermission: PERMISSIONS.DELETE
      })

      if (!permission) return reply.code(403).send({
        message: 'You do not have sufficient permission!'
      })

      if (!project) return reply.status(404).send({
        message: `Project with ID ${params.id} not found`
      })

      if (project?.products?.length > 0 && !schema.returnProducts) {
        return reply.code(406).send({
          message: 'Unable to proceed, there are products that have not been returned!'
        })
      }
      
      const deletedProject = { id: project.id, name: project.name }
      await project.remove()

      await Log.create({
        code: 'project:deleted',
        data: { id: deletedProject.id, name: deletedProject.name, ownerId: request.user.id },
        user: { id: request.user.id }
      }).save()

      return reply.code(200).send({
        message: 'Project deleted successfully',
        data: project
      })
    }
  }
}) 