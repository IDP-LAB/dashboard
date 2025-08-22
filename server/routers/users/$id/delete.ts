import { Router } from '@/controllers/router'
import { User } from '@/database/entity/User'
import { Log } from '@/database'
import { Role } from '@/database/enums'

export default new Router({
  name: 'Delete User',
  path: '/users/:id',
  description: 'Delete user by ID - Employees can only delete their own account',
  authenticate: true,
  methods: {
    async delete({ reply, request }) {
      const params = request.params as { id: string }
      const requestedId = Number(params.id)

      // Só pode deletar sua própria conta, se não for adm
      if ([Role.Student, Role.Teacher].includes(request.user.role) && request.user.id !== requestedId) {
        return reply.status(403).send({
          message: 'You can only delete your own account'
        })
      }

      const toDelete = await User.findOneBy({ id: requestedId })

      if (!toDelete) {
        return reply.status(404).send({
          message: `User with ID ${params.id} not found`
        })
      }

      const deletedUserSnapshot = { id: toDelete.id, name: toDelete.name, username: toDelete.username }

      const result = await User.delete({ id: requestedId })

      await Log.create({
        code: 'user:deleted',
        data: { id: deletedUserSnapshot.id, ownerId: request.user.id, name: deletedUserSnapshot.name, username: deletedUserSnapshot.username },
        user: { id: request.user.id }
      }).save()

      return reply.code(200).send({
        message: 'User deleted successfully',
        data: result,
      })
    }
  }
}) 