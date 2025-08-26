import { Log } from '@/database'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Delete Project',
  path: '/project/:id=number',
  description: 'Delete project by ID',
  method: 'delete',
  // authenticate: true,
  schema: z.object({
    returnProducts: z.boolean()
  }).default({ returnProducts: false }),
  handler: async ({ response, request, schema, url }) => {
    const projectId = url.getParams().id
    const [permission, project] = await hasProjectPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      projectId,
      requiredPermission: PERMISSIONS.DELETE
    })

    if (!permission) return response.code(403).send({
      message: 'You do not have sufficient permission!'
    })

    if (!project) return response.status(404).send({
      message: `Project with ID ${projectId} not found`
    })

    if (project?.products?.length > 0 && !schema.returnProducts) {
      return response.code(406).send({
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

    return response.code(200).send({
      message: 'Project deleted successfully',
      data: project
    })
  }
}) 