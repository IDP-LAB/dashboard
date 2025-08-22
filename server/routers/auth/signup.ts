import { Router } from '@/controllers/router.js'
import { User } from '@/database/entity/User'
import { Log } from '@/database'
import { Role } from '@/database/enums'
import { nanoid } from 'nanoid'
import z from 'zod'

// Gera uma rota aleatória a cada inicialização
const ADMIN_SIGNUP_TOKEN = nanoid(16)
const ADMIN_SIGNUP_PATH = `/auth/signup/${ADMIN_SIGNUP_TOKEN}`

// Exibe a rota no console na inicialização
console.log(`[Admin Signup] Rota temporária para criar administrador disponível em: ${ADMIN_SIGNUP_PATH}`)

export default new Router({
  path: ADMIN_SIGNUP_PATH,
  private: true,
  schema: {
    post: z.object({
      name: z.string().min(4).max(64),
      username: z.string().min(4).max(64),
      email: z.string().email(),
      language: z.string().default('pt-BR'),
      password: z.string().min(8).max(30)
    })
  },
  name: 'User Registration',
  description: 'Register a new user account with validation and secure password storage',
  methods: {
    async post({ reply, schema }) {
      const existUser = await User.createQueryBuilder('user')
        .where('user.email = :email', { email: schema.email })
        .orWhere('user.username = :username', { username: schema.username })
        .getOne()
      if (existUser) {
        return reply.status(422).send({
          message: 'A user with the provided email or username already exists. Please use different credentials.',
        })
      }
  
      const user = await (await User
        .create({ ...schema, role: Role.Administrator })
        .setPassword(schema.password))
        .save()
      
      await Log.create({
        code: 'user:created',
        data: { id: user.id, ownerId: user.id, name: user.name, username: user.username, email: user.email, role: user.role },
        user: { id: user.id }
      }).save()
  
      return reply.code(201).send({
        message: 'User registered successfully!',
        data: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email
        }
      })
    }
  }
})