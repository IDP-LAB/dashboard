import { Log } from '@/database'
import { User } from '@/database/entity/User'
import { Role } from '@/database/enums'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Delete User',
  path: '/users/:id=number',
  description: 'Delete user by ID - Employees can only delete their own account',
  method: 'delete',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const requestedId = url.getParams().id

    // Só pode deletar sua própria conta, se não for adm
    if ([Role.Student, Role.Teacher].includes(request.user.role) && request.user.id !== requestedId) {
      return response.status(403).send({
        message: 'You can only delete your own account'
      })
    }

    const toDelete = await User.findOneBy({ id: requestedId })
    if (!toDelete) return response.status(404).send({
      message: `User with ID ${requestedId} not found`
    })

    const deletedUserSnapshot = { id: toDelete.id, name: toDelete.name, username: toDelete.username }

    const result = await User.delete({ id: requestedId })

    await Log.create({
      code: 'user:deleted',
      data: { id: deletedUserSnapshot.id, ownerId: request.user.id, name: deletedUserSnapshot.name, username: deletedUserSnapshot.username },
      user: { id: request.user.id }
    }).save()

    return response.code(200).send({
      message: 'User deleted successfully',
      data: result,
    })
  }
}) 