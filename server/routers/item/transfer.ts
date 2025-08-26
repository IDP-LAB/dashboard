import { Log } from '@/database'
import dataSource from '@/database/dataSource'
import { Item } from '@/database/entity/Item'
import { ItemMovement } from '@/database/entity/ItemMovement'
import { ItemStatus, MovementType, Role } from '@/database/enums'
import { getLockingOptions } from '@/database/locking'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Find and Transfer Item',
  description: 'Encontra um item disponível por grupo e o transfere para um projeto.',
  // authenticate: true,
  method: 'post',
  schema: z.object({
    projectId: z.number().min(1),
    itemGroupUuid: z.string(),
    notes: z.string().optional()
  }),
  handler: async ({ response, request, schema }) => {
    const userId = request.user.id

    const [permission, project] = await hasProjectPermission({
      userId,
      projectId: schema.projectId,
      isAdmin: request.user.role === Role.Administrator,
      requiredPermission: PERMISSIONS.EDITOR,
    })

    if (!permission || !project) {
      return response.code(403).send({ message: 'Você não tem permissão para adicionar itens a este projeto.' })
    }

    try {
      const result = await dataSource.manager.transaction(async (tm) => {
        // Encontra o primeiro item disponível do grupo especificado
        const itemToTransfer = await tm.getRepository(Item).findOne({
          where: {
            group: { id: schema.itemGroupUuid },
            status: ItemStatus.Available,
          },
          relations: { group: true },
          ...getLockingOptions()
        })

        if (!itemToTransfer) {
          throw new Error('Nenhum item disponível encontrado para o grupo especificado.')
        }

        itemToTransfer.status = ItemStatus.InUse
        itemToTransfer.project = project
        await tm.save(itemToTransfer)

        const movement = tm.create(ItemMovement, {
          item: itemToTransfer,
          project,
          user: { id: userId },
          type: MovementType.Transfer_Out,
          quantity: 1, // Sempre 1, pois operamos em um item físico
          notes: schema.notes,
        })
        await tm.save(movement)

        return { item: itemToTransfer, movement }
      })

      // Log padronizado: item transferido (atualização)
      await Log.create({
        code: 'item:updated',
        data: { id: result.item.id, ownerId: request.user.id, name: result.item.name, projectId: project.id },
        user: { id: request.user.id }
      }).save()

      return response.code(200).send({
        message: 'Item transferido com sucesso.',
        data: result.item,
      })
    } catch (error) {
      console.error('Transfer Error:', error)
      return response.code(400).send({
        message: (error instanceof Error) ? error.message : 'Ocorreu um erro interno.'
      })
    }
  }
})