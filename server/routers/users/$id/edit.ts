import { Log } from '@/database'
import { User } from '@/database/entity/User'
import { Role } from '@/database/enums'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Edit User',
  path: '/users/:id=number',
  description: 'Update user information by ID - Employees can only update their own data',
  method: 'put',
  // authenticate: true,
  schema: z.object({
    name: z.string().min(4).max(64).optional(),
    username: z.string().min(4).max(64).optional(),
    language: z.string().optional(),
    password: z.string().min(8).max(30).optional()
  }),
  handler: async ({ response, request, schema, url }) => {
    const requestedId = url.getParams().id

    // Só pode editar seus próprios dados, se não for adm
    if ([Role.Student, Role.Teacher].includes(request.user.role) && request.user.id !== requestedId) {
      return response.status(403).send({
        message: 'You can only update your own user data'
      })
    }

    const user = await User.findOneBy({
      id: requestedId
    })

    if (!user) {
      return response.status(404).send({
        message: `User with ID ${requestedId} not found`
      })
    }

    if (schema.name) user.name = schema.name
    if (schema.username) user.username = schema.username
    if (schema.language) user.language = schema.language
    if (schema.password) await user.setPassword(schema.password)

    const result = await user.save()

    await Log.create({
      code: 'user:updated',
      data: { id: result.id, ownerId: request.user.id, name: result.name, username: result.username },
      user: { id: request.user.id }
    }).save()

    return response.code(200).send({
      message: 'User updated successfully',
      data: {
        ...result,
        password: undefined
      },
    })
  }
}) 