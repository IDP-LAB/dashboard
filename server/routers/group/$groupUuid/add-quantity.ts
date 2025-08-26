import { Log } from '@/database'
import { Group } from '@/database/entity/Group'
import { Item } from '@/database/entity/Item'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { Method } from '@asterflow/router'
import { z } from 'zod'

export default new Method({
  name: 'Add Group Quantity',
  path: '/group/:groupUuid/add-quantity',
  description: 'Adiciona quantidade a um grupo criando novos itens no mesmo grupo',
  method: 'post',
  // authenticate: true,
  schema: z.object({
    quantity: z.number().positive('Quantidade deve ser um número positivo')
  }),
  handler: async ({ response, request, schema, url }) => {
    const groupUuid = url.getParams().groupUuid

    // Buscar grupo e validar
    const group = await Group.findOne({ where: { id: groupUuid }, relations: { items: true, category: true, tags: true } })

    if (!group || group.items.length === 0) {
      return response.status(404).send({
        message: `Grupo ${groupUuid} não encontrado`
      })
    }

    const [permission] = await hasItemPermission({
      userId: request.user.id,
      isAdmin: request.user.role === Role.Administrator,
      itemId: group.items[0].id,
      requiredPermission: PERMISSIONS.EDITOR
    })

    if (!permission) return response.code(403).send({
      message: 'Você não tem permissão suficiente!'
    })

    try {
      // Criar novos itens baseados no primeiro item do grupo
      const newItems: Item[] = []
      const template = group.items[0]
      for (let i = 0; i < schema.quantity; i++) {
        const newItem = Item.create({
          name: template.name,
          description: template.description,
          location: template.location,
          price: template.price,
          type: template.type,
          status: template.status,
          acquisitionAt: template.acquisitionAt,
          group: group
        })
          
        newItems.push(newItem)
      }

      const savedItems = await Item.save(newItems)

      // Logs para cada novo item criado
      for (const savedItem of savedItems) {
        await Log.create({
          code: 'item:created',
          data: { id: savedItem.id, ownerId: request.user.id, name: savedItem.name, groupId: groupUuid },
          user: { id: request.user.id }
        }).save()
      }

      return response.code(201).send({
        message: `${schema.quantity} item(s) adicionado(s) ao grupo com sucesso`,
        data: {
          addedQuantity: schema.quantity,
          groupUuid: group.id,
          items: savedItems.map(item => ({
            id: item.id,
            name: item.name,
            groupUuid: group.id,
            status: item.status
          }))
        }
      })
    } catch (error) {
      console.error('Erro ao adicionar quantidade ao grupo:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao adicionar itens ao grupo'
      })
    }
  }
}) 
