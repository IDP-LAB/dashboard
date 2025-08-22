import { Router } from '@/controllers/router'
import { Log, Role } from '@/database'
import { Invite } from '@/database/entity/Invite'
import { parseDuration } from '@/utils/converters'
import { nanoid } from 'nanoid'
import z from 'zod'

export default new Router({
  name: 'CreateInvite',
  description: '',
  authenticate: [Role.Administrator],
  schema: {
    post: z.object({
      emails: z.array(z.string().email()).optional(),
      uses: z.number().min(1).default(1),
      role: z.enum([Role.Student, Role.Teacher]).default(Role.Teacher),
      expiresIn: z
        .string()
        .regex(
          /^\d+[dhm]$/i, // Valida formatos como 1d, 12h, 30m (case-insensitive)
          'O formato de expiração deve ser um número seguido de d (dias), h (horas), ou m (minutos).'
        )
        .default('7d')
    })
  },
  methods: {
    async post({ schema, reply, request }) {
      const expiresAt = parseDuration(schema.expiresIn)
      const uses = schema.emails ? schema.emails.length : schema.uses

      const invite = await Invite.create({
        emails: schema.emails?.map((email) => email.toLowerCase()),
        code: nanoid(),
        role: schema.role,
        uses,
        expiresAt
      }).save()

      await Log.create({
        code: 'invite:created',
        data: { id: invite.id, code: invite.code, role: invite.role, ownerId: request.user.id },
        user: { id: request.user.id }
      }).save()

      return reply.code(200).send({
        message: 'Invitation successfully created',
        data: invite
      })
    }
  }
})