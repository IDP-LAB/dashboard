import { Log } from '@/database'
import dataSource from '@/database/dataSource'
import { Item } from '@/database/entity/Item'
import { ItemMovement } from '@/database/entity/ItemMovement'
import { ItemStatus, ItemType, MovementType, Role } from '@/database/enums'
import { getLockingOptions } from '@/database/locking'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Consume Item By Group',
  method: 'post',
  description: 'Marca um item consumível, que está em uso por um projeto, como consumido.',
  // authenticate: true,
  schema: z.object({
    itemGroupUuid: z.string(),
    projectId: z.number().min(1),
    notes: z.string().optional()
  }),
  handler: async ({ response, request, schema }) => {
    const userId = request.user.id
      
    try {
      const result = await dataSource.manager.transaction(async (tm) => {
        const [permission] = await hasProjectPermission({
          userId,
          projectId: schema.projectId,
          isAdmin: request.user.role === Role.Administrator,
          requiredPermission: PERMISSIONS.EDITOR,
        })
        if (!permission) throw new Error('Você não tem permissão para gerenciar itens deste projeto.')

        // Encontra um item consumível do grupo que está em uso pelo projeto
        const itemToConsume = await tm.getRepository(Item).findOne({
          where: {
            group: { id: schema.itemGroupUuid },
            project: { id: schema.projectId },
            status: ItemStatus.InUse,
            type: ItemType.Consumable,
          },
          relations: { project: true, group: true },
          ...getLockingOptions()
        })

        if (!itemToConsume) throw new Error(`Nenhum item consumível do grupo ${schema.itemGroupUuid} está em uso pelo projeto ${schema.projectId}.`)

        itemToConsume.status = ItemStatus.Consumed
        // O item continua associado ao projeto para histórico de custos
        await tm.save(itemToConsume)

        const movement = tm.create(ItemMovement, {
          item: itemToConsume,
          project: itemToConsume.project ?? undefined,
          user: { id: userId },
          type: MovementType.Consumed,
          quantity: 1,
          notes: schema.notes,
        })
        await tm.save(movement)

        return { item: itemToConsume, movement }
      })

      await Log.create({
        code: 'item:updated',
        data: { id: result.item.id, ownerId: request.user.id, name: result.item.name, projectId: result.item.project?.id },
        user: { id: request.user.id }
      }).save()

      return response.code(200).send({ message: 'Item marcado como consumido com sucesso.', data: result.item })
    } catch (error) {
      console.error('Consume Error:', error)
      return response.code(400).send({
        message: (error instanceof Error) ? error.message : 'Ocorreu um erro interno.'
      })
    }
  }
})