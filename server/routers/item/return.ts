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
  name: 'Return Item By Group',
  description: 'Devolve um ou mais itens de um projeto para o estoque, usando o grupo do item.',
  // authenticate: true,
  method: 'post',
  schema: z.object({
    itemGroupUuid: z.string(),
    projectId: z.number().min(1),
    quantity: z.number().int().positive().optional(),
    notes: z.string().optional()
  }),
  handler: async ({ response, request, schema }) => {
    const userId = request.user.id
      
    try {
      const returnedItems = await dataSource.manager.transaction(async (tm) => {
        const [permission, projectFrom] = await hasProjectPermission({
          userId,
          projectId: schema.projectId,
          isAdmin: request.user.role === Role.Administrator,
          requiredPermission: PERMISSIONS.EDITOR,
        })
        if (!permission || !projectFrom) {
          throw new Error('Você não tem permissão para gerenciar itens deste projeto.')
        }
          
        // Modifica a query para buscar múltiplos itens
        const queryBuilder = tm.getRepository(Item).createQueryBuilder('item')
          .innerJoin('item.group', 'group')
          .where('group.id = :groupUuid', { groupUuid: schema.itemGroupUuid })
          .andWhere('item.projectId = :projectId', { projectId: schema.projectId })
          .andWhere('item.status = :status', { status: ItemStatus.InUse })

        const lockMode = getLockingOptions()?.lock?.mode
        if (lockMode) queryBuilder.setLock(lockMode)

        // Se uma quantidade foi especificada, limita o resultado
        if (schema.quantity) queryBuilder.take(schema.quantity)
          
        const itemsToReturn = await queryBuilder.getMany()

        if (itemsToReturn.length === 0) {
          throw new Error(`Nenhum item do grupo ${schema.itemGroupUuid} está em uso pelo projeto ${schema.projectId}.`)
        }

        // Prepara as entidades para atualização e registro de movimento
        const updatedItems: Item[] = []
        const newMovements: ItemMovement[] = []

        for (const item of itemsToReturn) {
          item.status = ItemStatus.Available
          item.project = null // Desassocia do projeto
          updatedItems.push(item)

          newMovements.push(tm.create(ItemMovement, {
            item: { id: item.id }, // Passa apenas o ID para evitar circularidade
            project: projectFrom,  // Mantém o projeto de origem no histórico
            user: { id: userId },
            type: MovementType.Transfer_In,
            quantity: 1, // Cada movimento representa 1 item físico
            notes: schema.notes,
          }))
        }
          
        // Salva todas as atualizações
        await tm.save(Item, updatedItems)
        await tm.save(ItemMovement, newMovements)

        return updatedItems // Retorna a lista de itens que foram devolvidos
      })

      const message = `${returnedItems.length} item(s) devolvido(s) com sucesso.`

      // Logs padronizados: itens atualizados (retornados)
      for (const item of returnedItems) {
        await Log.create({
          code: 'item:updated',
          data: { id: item.id, ownerId: request.user.id, name: item.name },
          user: { id: request.user.id }
        }).save()
      }
      return response.code(200).send({
        message,
        data: returnedItems,
        metadata: {
          totalPages: 1,
          currentPage: 1,
          total: returnedItems.length,
          pageSize: returnedItems.length,
        }
      })

    } catch (error) {
      console.error('Return Error:', error)
      return response.code(400).send({
        message: (error instanceof Error) ? error.message : 'Ocorreu um erro interno.'
      })
    }
  }
})