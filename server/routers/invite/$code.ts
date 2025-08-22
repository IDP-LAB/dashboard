import { Router } from '@/controllers/router'
import { Log, User } from '@/database'
import { Invite } from '@/database/entity/Invite'
import z from 'zod'

export default new Router({
  name: 'InviteClaim',
  description: '',
  path: '/invite/:code',
  schema: {
    post: z.object({
      name: z.string().min(4).max(64),
      username: z.string().min(4).max(64),
      email: z.string().email(),
      language: z.string().default('pt-BR'),
      password: z.string().min(8).max(30)
    })
  },
  methods: {
    // Validação/consulta de convite por código
    async get({ request, reply }) {
      const params = request.params as { code: string }
      const code = params.code
      const invite = await Invite.findOne({ 
        where: { code },
        relations: { users: true }
      })

      if (!invite) return reply.code(404).send({
        message: 'Invitation not found!'
      })

      const used = invite.users.length
      const remaining = Math.max(0, invite.uses - used)
      const now = new Date()
      const isExpired = invite.expiresAt ? invite.expiresAt.getTime() <= now.getTime() : false

      if (used >= invite.uses) {
        return reply.code(400).send({
          message: 'Invitation expired, usage limit reached maximum allowed'
        })
      }

      if (isExpired) {
        return reply.code(400).send({
          message: 'Invitation expired by time'
        })
      }

      return reply.code(200).send({
        message: 'Successfully requesting invitation.',
        data: {
          role: invite.role,
          used,
          remaining,
          expiresAt: invite.expiresAt ?? null
        }
      })
    },
    async post({ request, schema, reply }) {
      const params = request.params as { code: string }
      const code = params.code
      const invite = await Invite.findOne({ 
        where: {
          code
        },
        relations: {
          users: true
        }
      })

      if (!invite) return reply.code(404).send({
        message: 'Invitation not found!'
      })

      if (invite.emails && !invite.emails.includes(schema.email.toLowerCase())) return reply.code(406).send({
        message: 'The email address you entered is not on the list of allowed emails.'
      })

      if (invite.users.length === invite.uses) {
        return reply.code(400).send({
          message: 'Invitation expired, usage limit reached maximum allowed'
        })
      }

      const existUser = await User.createQueryBuilder('user')
        .where('user.email = :email', { email: schema.email })
        .orWhere('user.username = :username', { username: schema.username })
        .getOne()

      if (existUser) return reply
        .status(422)
        .send({
          message: 'A user with the provided email or username already exists. Please use different credentials.',
        })

      const user = await (await User
        .create({ ...schema, role: invite.role })
        .setPassword(schema.password))
        .save()

      await Log.create({
        code: 'invite:claimed',
        data: { userId: user.id, inviteCode: invite.code },
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