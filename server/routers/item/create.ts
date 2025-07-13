import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item'
import { ItemCategory } from '@/database/entity/ItemCategory'
import { ItemTag } from '@/database/entity/ItemTag'
import { ItemStatus, ItemType } from '@/database/enums'
import { z } from 'zod'

// garante que 'id' ou 'name' seja fornecido
const idOrNameSchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(2).max(64).optional(),
}).refine(data => data.id || data.name, {
  message: 'Deve ser fornecido "id" ou "name" para categoria/tag.',
})

export default new Router({
  name: 'CreateItem',
  path: '/item',
  description: 'Cria um ou mais itens e os agrupa. Se um grupo similar já existir, os novos itens serão adicionados a ele.',
  authenticate: true,
  schema: {
    post: z.object({
      name: z.string().min(4).max(64),
      description: z.string().min(4).max(512).optional(),
      location: z.string().min(4).max(256).optional(),
      price: z.number().positive().optional(),
      type: z.nativeEnum(ItemType).default(ItemType.Consumable),
      category: idOrNameSchema,
      tags: z.array(idOrNameSchema).optional(),
      quantity: z.number().int().min(1).default(1),
    })
  },
  methods: {
    async post({ schema, reply }) {
      let category: ItemCategory | null = null
      if (schema.category.id) {
        category = await ItemCategory.findOneBy({ id: schema.category.id })
        if (!category) return reply.code(404).send({ message: `Categoria com ID ${schema.category.id} não encontrada.` })
      } else if (schema.category.name) {
        category = await ItemCategory.findOneBy({ name: schema.category.name })
        if (!category) {
          category = await ItemCategory.create({ name: schema.category.name }).save()
        }
      }
      
      const tags: ItemTag[] = []
      if (schema.tags) {
        for (const tagInput of schema.tags) {
          let tagEntity: ItemTag | null = null
          if (tagInput.id) {
            tagEntity = await ItemTag.findOneBy({ id: tagInput.id })
            if (!tagEntity) return reply.code(404).send({ message: `Tag com ID ${tagInput.id} não encontrada.` })
          } else if (tagInput.name) {
            tagEntity = await ItemTag.findOneBy({ name: tagInput.name })
            if (!tagEntity) {
              tagEntity = await ItemTag.create({ name: tagInput.name }).save()
            }
          }
          if (tagEntity) tags.push(tagEntity)
        }
      }
      
      // Agrupamento
      const tempItemForGrouping = Item.create({
        category: category ?? undefined,
        tags,
        name: schema.name,
      })
      await tempItemForGrouping.findAndSetGroup()
      const groupUuid = tempItemForGrouping.groupUuid

      const items: Partial<Item>[] = []
      for (let i = 0; i < schema.quantity; i++) {
        items.push({
          ...schema,
          groupUuid,
          status: ItemStatus.Available,
          category: category ?? undefined,
          tags,
        })
      }

      const savedItems = await Item.save(items)

      return reply.code(201).send({
        message: `${schema.quantity} item(s) criados e agrupados com sucesso!`,
        data: savedItems,
        metadata: {
          total: savedItems.length,
          currentPage: 1,
          totalPages: 1,
          pageSize: savedItems.length
        }
      })
    }
  }
})