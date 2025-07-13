import { Router } from '@/controllers/router'
import dataSource from '@/database/dataSource'
import { Item } from '@/database/entity/Item'
import { ItemMovement } from '@/database/entity/ItemMovement'
import { ItemStatus, MovementType, Role } from '@/database/enums'
import { getLockingOptions } from '@/database/locking'
import { PERMISSIONS } from '@/database/permissions'
import { hasProjectPermission } from '@/helper/hasProjectPermission'
import { z } from 'zod'

export default new Router({
  name: 'Find and Transfer Item',
  path: '/item/transfer',
  description: 'Encontra um item disponível por grupo e o transfere para um projeto.',
  authenticate: true,
  schema: {
    post: z.object({
      projectId: z.number().min(1),
      itemGroupUuid: z.string().length(21),
      notes: z.string().optional()
    })
  },
  methods: {
    async post({ reply, request, schema }) {
      const userId = request.user.id

      const [permission, project] = await hasProjectPermission({
        userId,
        projectId: schema.projectId,
        isAdmin: request.user.role === Role.Administrator,
        requiredPermission: PERMISSIONS.EDITOR,
      })

      if (!permission || !project) {
        return reply.code(403).send({ message: 'Você não tem permissão para adicionar itens a este projeto.' })
      }

      try {
        const result = await dataSource.manager.transaction(async (tm) => {
          // Encontra o primeiro item disponível do grupo especificado
          const itemToTransfer = await tm.getRepository(Item).findOne({
            where: {
              groupUuid: schema.itemGroupUuid,
              status: ItemStatus.Available,
            },
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

        return reply.code(200).send({
          message: 'Item transferido com sucesso.',
          data: result.item,
        })
      } catch (error) {
        console.error('Transfer Error:', error)
        return reply.code(400).send({
          message: (error instanceof Error) ? error.message : 'Ocorreu um erro interno.'
        })
      }
    },
  },
})