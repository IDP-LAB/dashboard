import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Get Project',
  path: '/project/:id=number',
  description: 'Get project information by ID',
  method: 'get',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const projectId = url.getParams().id
    const [permission, project] = await hasProjectPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      projectId,
      requiredPermission: PERMISSIONS.VIEWER,
    })

    if (!permission) return response.code(403).send({
      message: 'You do not have sufficient permission!'
    })

    if (!project) return response.status(404).send({
      message: `User with ID ${projectId} not found`
    })

    return response.code(200).send({
      message: 'User details retrieved successfully',
      data: project,
    })
  }
}) 