import { Log } from '@/database'
import { ProjectStatus, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Edit Project',
  path: '/project/:id=number',
  description: 'Update project information by ID',
  method: 'put',
  // authenticate: true,
  schema: z.object({
    name: z.string().min(4).max(64).optional(),
    status: z.nativeEnum(ProjectStatus).optional()
  }),
  handler: async ({ response, request, schema, url }) => {
    const projectId = url.getParams().id
    const [permission, project] = await hasProjectPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      projectId,
      requiredPermission: PERMISSIONS.EDITOR,
    })

    if (!permission) return response.code(403).send({
      message: 'You do not have sufficient permission!'
    })

    if (!project) return response.status(404).send({
      message: `Project with ID ${projectId} not found`
    })

    if (schema.name) project.name = schema.name
    if (schema.status) project.status = schema.status

    const result = await project.save()

    await Log.create({
      code: 'project:updated',
      data: { id: result.id, ownerId: request.user.id, name: result.name },
      user: { id: request.user.id }
    }).save()

    return response.code(200).send({
      message: 'User updated successfully',
      data: result
    })
  }
}) 