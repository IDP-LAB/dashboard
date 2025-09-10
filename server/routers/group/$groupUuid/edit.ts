import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item'
import { ItemTag } from '@/database/entity/ItemTag'
import { Group } from '@/database/entity/Group'
import { ItemCategory } from '@/database/entity/ItemCategory'
import { Log } from '@/database'
import { ItemType, ItemStatus, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { z } from 'zod'

const idOrNameSchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(1).optional(),
}).refine(data => data.id || data.name, {
  message: 'Deve ser fornecido "id" ou "name" para a tag.',
})

const editGroupSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  type: z.nativeEnum(ItemType),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }),
  description: z.string().optional(),
  acquisitionAt: z.string().optional(),
  price: z.number().optional(),
  location: z.string().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
  tags: z.array(idOrNameSchema).optional(),
})

export default new Router({
  name: 'Edit Group Items',
  path: '/group/:groupUuid/edit',
  description: 'Edita todos os itens de um grupo',
  authenticate: true,
  schema: {
    put: editGroupSchema
  },
  methods: {
    async put({ reply, request, schema }) {
      const params = request.params as { groupUuid: string }
      const { groupUuid } = params

      // Buscar o grupo com itens
      const group = await Group.findOne({ where: { id: groupUuid }, relations: { items: true, category: true, tags: true } })

      if (!group || group.items.length === 0) {
        return reply.status(404).send({
          message: `Nenhum item encontrado no grupo ${groupUuid}`
        })
      }

      // Verificar permissão usando o primeiro item do grupo
      const [permission] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId: group.items[0].id,
        requiredPermission: PERMISSIONS.EDITOR
      })

      if (!permission) {
        return reply.code(403).send({
          message: 'Você não tem permissão suficiente!'
        })
      }

      try {
        // Atualizar dados do grupo (nome/descrição/categoria)
        if (schema.name) group.name = schema.name
        if (schema.description !== undefined) group.description = schema.description
        if (schema.category && typeof schema.category.id === 'number') {
          const category = await ItemCategory.findOne({ where: { id: schema.category.id } })
          group.category = category ?? null
        }
        await group.save()

        // Atualizar tags do grupo, criando se necessário
        if (schema.tags) {
          const tagEntities: ItemTag[] = []
          for (const t of schema.tags) {
            let entity: ItemTag | null = null
            if (t.id) {
              entity = await ItemTag.findOne({ where: { id: t.id } })
              if (!entity) continue
            } else if (t.name) {
              entity = await ItemTag.findOne({ where: { name: t.name } })
              if (!entity) {
                entity = await ItemTag.create({ name: t.name }).save()
              }
            }
            if (entity) tagEntities.push(entity)
          }
          group.tags = tagEntities
          await group.save()
        }
        
        // Atualizações reflexivas nos itens (campos replicados)
        const updateData: Partial<Item> = {}
        if (schema.type) updateData.type = schema.type
        if (schema.status !== undefined) updateData.status = schema.status
        if (schema.location !== undefined) updateData.location = schema.location
        if (schema.price !== undefined) updateData.price = schema.price
        if (schema.acquisitionAt) updateData.acquisitionAt = schema.acquisitionAt
        if (schema.description !== undefined) updateData.description = schema.description
        if (schema.name) updateData.name = schema.name
        if (Object.keys(updateData).length) {
          await Item.createQueryBuilder()
            .update(Item)
            .set(updateData)
            .where('groupId = :groupUuid', { groupUuid })
            .execute()
        }

        // Buscar itens atualizados para retornar
        const updatedItems = await Group.findOne({ where: { id: groupUuid }, relations: { items: true, tags: true, category: true } })

        const updatedCount = updatedItems?.items.length ?? 0

        // Logs para cada item atualizado no grupo
        if (updatedItems?.items && Object.keys(updateData).length > 0) {
          for (const item of updatedItems.items) {
            await Log.create({
              code: 'item:updated',
              data: { id: item.id, ownerId: request.user.id, name: item.name, groupId: groupUuid },
              user: { id: request.user.id }
            }).save()
          }
        }
        return reply.code(200).send({
          message: `${updatedCount} item(s) do grupo atualizados com sucesso`,
          data: {
            updatedCount,
            groupUuid: groupUuid,
            items: updatedItems?.items.map(item => ({
              id: item.id,
              name: item.name,
              type: item.type,
              status: item.status,
              location: item.location,
              price: item.price,
              description: item.description,
            })) ?? [],
            tags: updatedItems?.tags ?? [],
            category: updatedItems?.category ?? null,
          }
        })
      } catch (error) {
        console.error('Erro ao atualizar grupo:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao atualizar grupo'
        })
      }
    }
  }
}) 
