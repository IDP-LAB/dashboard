// server/routers/item/$id/edit.ts
import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item' // É necessário importar a entidade Item
import { Log } from '@/database'
import { ItemStatus, ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { z } from 'zod'
import { idOrNameSchema } from '../create'

export default new Router({
  name: 'Edit Item',
  path: '/item/:id',
  description: 'Update individual item information by ID.',
  authenticate: true,
  schema: {
    put: z.object({
      name: z.string().max(256).optional(),
      description: z.string().max(2048).optional(),
      location: z.string().max(256).optional(),
      price: z.number().positive().optional(),
      type: z.nativeEnum(ItemType).optional(),
      status: z.nativeEnum(ItemStatus).optional(),
      category: idOrNameSchema.optional(),
      tags: z.array(idOrNameSchema).optional(),
      acquisitionAt: z.string().optional(),
    })
  },
  methods: {
    async put({ reply, request, schema }) {
      const params = request.params as { id: string }
      const itemId = Number(params.id)

      console.log(schema)
      
      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.EDITOR,
      })

      if (!item) {
        return reply.status(404).send({
          message: `Item com ID ${params.id} não encontrado`
        })
      }

      if (!permission) {
        return reply.code(403).send({
          message: 'Você não tem permissão suficiente!'
        })
      }

      try {
        // Atualizar apenas o item individual
        Object.assign(item, schema)
        const result = await item.save()

        await Log.create({
          code: 'item:updated',
          data: { id: result.id, ownerId: request.user.id, name: result.name },
          user: { id: request.user.id }
        }).save()

        return reply.code(200).send({
          message: 'Item atualizado com sucesso',
          data: result
        })
      } catch (error) {
        console.error('Erro ao atualizar item:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao atualizar item'
        })
      }
    }
  }
})