import { Log } from '@/database'
import { User } from '@/database/entity/User'
import { Role } from '@/database/enums'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Create User',
  path: '/users',
  method: 'post',
  description: 'Create a new user in the system - administrator/HR access only',
  // authenticate: [Role.Administrator],
  schema: z.object({
    name: z.string().min(4).max(64),
    username: z.string().min(4).max(64),
    email: z.string().email(),
    language: z.string(),
    password: z.string().min(8).max(30),
    role: z.nativeEnum(Role),
  }),
  handler: async ({ response, schema, request }) => {
    // Verificar permissões baseadas no role do usuário autenticado
    if (request.user.role !== Role.Administrator) {
      return response.status(403).send({
        message: 'Administradores só podem criar usuários com função de Student.',
      })
    }

    const existUser = await User.findOneBy({ 
      email: schema.email 
    })

    if (existUser) return response.status(422).send({
      message: 'Um usuário com este email já existe no sistema.',
    })


    const user = await (await User
      .create({ ...schema })
      .setPassword(schema.password))
      .save()

    await Log.create({
      code: 'user:created',
      data: { id: user.id, ownerId: request.user.id, name: user.name, username: user.username, email: user.email, role: user.role },
      user: { id: request.user.id }
    }).save()

    return response.code(201).send({
      message: 'Usuário criado com sucesso!',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    })
  }
}) 