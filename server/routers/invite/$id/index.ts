import { Router } from '@/controllers/router'
import { Role } from '@/database'
import { Invite } from '@/database/entity/Invite'
import { parseDuration } from '@/utils/converters'
import z from 'zod'

const updateInviteSchema = z.object({
  emails: z.array(z.string().email()).optional(),
  uses: z.number().min(1).optional(),
  role: z.enum([Role.Student, Role.Teacher]).optional(),
  expiresIn: z
    .string()
    .regex(/^\d+[dhm]$/i, 'O formato de expiração deve ser um número seguido de d (dias), h (horas), ou m (minutos).')
    .optional()
})

export default new Router({
  name: 'InviteById',
  path: '/invite/id/:id',
  description: 'Recupera, atualiza ou remove um convite por id (apenas administradores)'.trim(),
  authenticate: [Role.Administrator],
  schema: {
    put: updateInviteSchema
  },
  methods: {
    async get({ reply, request }) {
      const params = request.params as { id: string }
      const id = Number(params.id)

      const invite = await Invite.findOne({ where: { id }, relations: { users: true } })
      if (!invite) {
        return reply.code(404).send({ message: 'Convite não encontrado' })
      }

      return reply.code(200).send({
        message: 'Convite recuperado com sucesso',
        data: invite
      })
    },
    async put({ reply, request, schema }) {
      const params = request.params as { id: string }
      const id = Number(params.id)

      try {
        const invite = await Invite.findOne({ where: { id }, relations: { users: true } })
        if (!invite) {
          return reply.code(404).send({ message: 'Convite não encontrado' })
        }

        if (schema.emails) invite.emails = schema.emails
        if (typeof schema.uses === 'number') invite.uses = schema.uses
        if (schema.role) invite.role = schema.role
        if (schema.expiresIn) invite.expiresAt = parseDuration(schema.expiresIn)

        const saved = await invite.save()

        return reply.code(200).send({
          message: 'Convite atualizado com sucesso',
          data: saved
        })
      } catch (error) {
         
        console.error('Erro ao atualizar convite:', error)
        return reply.code(500).send({ message: 'Erro interno do servidor ao atualizar convite' })
      }
    },
    async delete({ reply, request }) {
      const params = request.params as { id: string }
      const id = Number(params.id)

      try {
        const invite = await Invite.findOne({ where: { id }, relations: { users: true } })
        if (!invite) {
          return reply.code(404).send({ message: 'Convite não encontrado' })
        }

        await invite.remove()

        return reply.code(200).send({
          message: 'Convite deletado com sucesso',
          data: null
        })
      } catch (error) {
         
        console.error('Erro ao deletar convite:', error)
        return reply.code(500).send({ message: 'Erro interno do servidor ao deletar convite' })
      }
    }
  }
})


