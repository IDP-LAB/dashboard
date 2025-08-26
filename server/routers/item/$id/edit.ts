import { Log } from '@/database'
import { ItemStatus, ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { Method } from '@asterflow/router'
import { z } from 'zod'
import { idOrNameSchema } from '../create'

export default new Method({
  name: 'Edit Item',
  path: '/item/:id=number',
  description: 'Update individual item information by ID.',
  method: 'put',
  // authenticate: true,
  schema:  z.object({
    name: z.string().max(256).optional(),
    description: z.string().max(2048).optional(),
    location: z.string().max(256).optional(),
    price: z.number().positive().optional(),
    type: z.nativeEnum(ItemType).optional(),
    status: z.nativeEnum(ItemStatus).optional(),
    category: idOrNameSchema.optional(),
    tags: z.array(idOrNameSchema).optional(),
    acquisitionAt: z.string().optional(),
  }),
  handler: async ({ response, request, schema, url }) => {
    const itemId = url.getParams().id
    const [permission, item] = await hasItemPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      itemId,
      requiredPermission: PERMISSIONS.EDITOR,
    })

    if (!item) return response.status(404).send({
      message: `Item com ID ${itemId} não encontrado`
    })

    if (!permission) return response.code(403).send({
      message: 'Você não tem permissão suficiente!'
    })

    try {
      // Atualizar apenas o item individual
      Object.assign(item, schema)
      const result = await item.save()

      await Log.create({
        code: 'item:updated',
        data: { id: result.id, ownerId: request.user.id, name: result.name },
        user: { id: request.user.id }
      }).save()

      return response.code(200).send({
        message: 'Item atualizado com sucesso',
        data: result
      })
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao atualizar item'
      })
    }
  }
})