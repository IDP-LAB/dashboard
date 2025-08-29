import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item'
import { Log } from '@/database'
import { ItemCategory } from '@/database/entity/ItemCategory'
import { ItemTag } from '@/database/entity/ItemTag'
import { File, FileType } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { ItemStatus, ItemType } from '@/database/enums'
import { storage } from '@/index'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// garante que 'id' ou 'name' seja fornecido
export const idOrNameSchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(2).max(64).optional(),
}).refine(data => data.id || data.name, {
  message: 'Deve ser fornecido "id" ou "name" para categoria/tag.',
})

const itemSchema = z.object({
  name: z.string().max(256),
  description: z.string().max(2048).optional(),
  assetCode: z.string().max(256).optional(),
  serial: z.string().max(256).optional(),
  location: z.string().max(256).optional(),
  price: z.number().positive().optional(),
  type: z.nativeEnum(ItemType).optional().default(ItemType.Consumable),
  status: z.nativeEnum(ItemStatus).optional().default(ItemStatus.Available),
  quantity: z.number().int().min(1).default(1),
  acquisitionAt: z.string().optional(),
  category: idOrNameSchema,
  tags: z.array(idOrNameSchema).optional(),
})

type FileMetadata = {
  filename: string,
  mimetype: string,
  data: Buffer
}

export default new Router({
  name: 'CreateItem',
  path: '/item',
  description: 'Cria um ou mais itens e os agrupa em um Group (UUID). Se um grupo similar já existir, os novos itens serão adicionados a ele.',
  authenticate: true,
  methods: {
    async post({ reply, request }) {
      const parts = request.parts()
      const fields: Record<string, any> = { tags: [], assetCodes: [], serials: [] }
      const files: FileMetadata[] = []
      
      for await (const part of parts) {
        if (part.type === 'file') {
          // É um arquivo
          const buffer = await part.toBuffer()
          files.push({
            filename: part.filename,
            mimetype: part.mimetype,
            data: buffer,
          })
        } else {
          // É um campo do formulário
          let value: any = part.value
          
          // Converter valores numéricos
          if (part.fieldname === 'price' || part.fieldname === 'quantity') {
            value = Number(value)
          }
          
          // Processar categoria
          if (part.fieldname.startsWith('category[')) {
            if (!fields.category) fields.category = {}
            const match = part.fieldname.match(/category\[(\w+)\]/)
            const key = match ? match[1] : null
            if (key) {
              if (key === 'id') {
                fields.category[key] = Number(value)
              } else {
                fields.category[key] = value
              }
            }
          } else if (part.fieldname.startsWith('tags[')) {
            // Processar tags[i][id] ou tags[i][name]
            const match = part.fieldname.match(/tags\[(\d+)\]\[(\w+)\]/)
            if (match) {
              const index = parseInt(match[1], 10)
              const key = match[2]
              if (!Array.isArray(fields.tags)) fields.tags = []
              if (!fields.tags[index]) fields.tags[index] = {}
              if (key === 'id') {
                fields.tags[index][key] = Number(value)
              } else {
                fields.tags[index][key] = value
              }
            }
          } else if (/^assetCodes\[(\d+)\]$/.test(part.fieldname)) {
            const index = parseInt(part.fieldname.match(/^assetCodes\[(\d+)\]$/)![1], 10)
            fields.assetCodes[index] = String(value)
          } else if (/^serials\[(\d+)\]$/.test(part.fieldname)) {
            const index = parseInt(part.fieldname.match(/^serials\[(\d+)\]$/)![1], 10)
            fields.serials[index] = String(value)
          } else {
            fields[part.fieldname] = value
          }
        }
      }
      
      // Validar os dados do formulário manualmente
      try {
        const validationResult = await itemSchema.safeParseAsync(fields)
        if (!validationResult.success) {
          return reply.code(400).send({
            message: 'Dados inválidos',
            error: validationResult.error
          })
        }
        
        const schema = validationResult.data
        
        let category: ItemCategory | null = null
        if (schema.category.id) {
          category = await ItemCategory.findOneBy({ id: schema.category.id })
          if (!category) return reply.code(404).send({ message: `Categoria com ID ${schema.category.id} não encontrada.` })
        } else if (schema.category.name) {
          category = await ItemCategory.findOneBy({ name: schema.category.name })
          if (!category) category = await ItemCategory.create({ name: schema.category.name }).save()
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
        
        // Agrupamento via Group (UUID)
        let group: Group | null = null
        if (fields.groupUuid) {
          group = await Group.findOne({ where: { id: String(fields.groupUuid) }, relations: { items: true } })
          if (!group) return reply.code(404).send({ message: `Group ${fields.groupUuid} não encontrado.` })
        } else {
          // Encontrar grupo existente com mesma categoria e mesmo conjunto de tags
          const existing = await Group.createQueryBuilder('group')
            .leftJoinAndSelect('group.tags', 'tag')
            .leftJoinAndSelect('group.category', 'category')
            .where('category.id = :categoryId', { categoryId: category?.id })
            .getMany()
          // Verificação simples de igualdade de conjunto de tags
          const desiredTagIds = (tags ?? []).map(t => t.id).sort().join(',')
          group = existing.find(g => (g.tags ?? []).map(t => t.id).sort().join(',') === desiredTagIds) ?? null
          if (!group) {
            group = await Group.create({ name: schema.name, description: schema.description, category: category ?? undefined, tags }).save()
          }
        }

        const items: Partial<Item>[] = []
        const hasBatchAsset = Array.isArray(fields.assetCodes)
        const hasBatchSerial = Array.isArray(fields.serials)
        for (let i = 0; i < schema.quantity; i++) {
          const batchAsset = hasBatchAsset ? (typeof fields.assetCodes[i] === 'string' && fields.assetCodes[i].length > 0 ? fields.assetCodes[i] : undefined) : undefined
          const batchSerial = hasBatchSerial ? (typeof fields.serials[i] === 'string' && fields.serials[i].length > 0 ? fields.serials[i] : undefined) : undefined
          const newItem: Partial<Item> = {
            name: schema.name,
            description: schema.description,
            location: schema.location,
            price: schema.price,
            type: schema.type,
            status: schema.status,
            acquisitionAt: schema.acquisitionAt,
            group: group!,
            createdBy: { id: request.user.id } as any,
            // Preferir arrays quando presentes; só usar campos únicos quando não for batch
            assetCode: hasBatchAsset || hasBatchSerial ? batchAsset : (fields.assetCode ?? undefined),
            serial: hasBatchAsset || hasBatchSerial ? batchSerial : (fields.serial ?? undefined),
          }
          items.push(newItem)
        }

        const savedItems = await Item.save(items) as Item[]

        // Log padronizado: item(s) criado(s)
        for (const saved of savedItems) {
          await Log.create({
            code: 'item:created',
            data: { id: saved.id, ownerId: request.user.id, name: saved.name, groupId: group?.id },
            user: { id: request.user.id }
          }).save()
        }

        // Processar uploads de arquivos
        try {
          if (files.length > 0 && savedItems.length > 0) {
            // Para simplificar, vamos associar os arquivos ao primeiro item criado
            const firstItemId = savedItems[0].id
            
            const fileEntities: File[] = []

            for (const uploadedFile of files) {
              // Gerar nome único para o arquivo
              const fileExtension = uploadedFile.filename.split('.').pop() || ''
              const uniqueFilename = `${nanoid()}.${fileExtension}`
              
              // Determinar tipo de arquivo baseado no MIME type
              const fileType = uploadedFile.mimetype.startsWith('image/') ? FileType.Photo : FileType.Document
              
              // Salvar arquivo usando o storage
              const folder = `items/${firstItemId}/${fileType}s`
              await storage.save(uniqueFilename, uploadedFile.data, { folder })
              
              // Criar registro no banco
              const fileEntity = File.create({
                filename: uniqueFilename,
                originalName: uploadedFile.filename,
                mimeType: uploadedFile.mimetype,
                size: uploadedFile.data.length,
                type: fileType,
                path: folder,
                group: group!
              })
              
              fileEntities.push(fileEntity)
            }
            
            // Salvar todos os arquivos no banco
            await File.save(fileEntities)
          }
        } catch (error) {
          console.error('Erro ao processar uploads:', error)
          // Não vamos falhar a criação do item por causa de erro no upload
        }

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
      } catch (error) {
        console.error('Erro ao processar requisição:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor'
        })
      }
    }
  }
})