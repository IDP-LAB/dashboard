import { User } from '@/database/entity/User'
import { Role } from '@/database/enums'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Get User',
  path: '/users/:id=number',
  description: 'Get user information by ID - Employees can only access their own data',
  method: 'get',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const requestedId = url.getParams().id

    // Se for Employee, só pode ver seus próprios dados
    if ([Role.Student, Role.Teacher].includes(request.user.role) && request.user.id !== requestedId) {
      return response.status(403).send({
        message: 'You can only access your own user data'
      })
    }

    const user = await User.findOneBy({ id: requestedId })

    if (!user) {
      return response.status(404).send({
        message: `User with ID ${requestedId} not found`
      })
    }

    return response.code(200).send({
      message: 'User details retrieved successfully',
      data: user,
    })
  }
}) 