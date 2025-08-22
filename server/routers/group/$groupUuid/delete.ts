import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item'
import { File } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { Log } from '@/database'
import { ItemType, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { storage } from '@/index'
import { z } from 'zod'

export default new Router({
  name: 'Delete Group',
  path: '/group/:groupUuid',
  description: 'Delete all items in a group by groupUuid.',
  authenticate: true,
  schema: {
    delete: z.object({
      returnProducts: z.boolean()
    }).default({ returnProducts: false })
  },
  methods: {
    async delete({ reply, request, schema }) {
      const params = request.params as { groupUuid: string }
      const { groupUuid } = params
      
      try {
        // Buscar todos os itens do grupo
        const group = await Group.findOne({ where: { id: groupUuid }, relations: { items: true } })

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
          requiredPermission: PERMISSIONS.DELETE
        })

        if (!permission) {
          return reply.code(403).send({
            message: 'Você não tem permissão suficiente!'
          })
        }

        // Verificar se há itens de equipamento e se o usuário é admin
        const hasEquipment = group.items.some(item => item.type === ItemType.Equipment)
        if (hasEquipment && request.user.role !== Role.Administrator) {
          return reply.status(403).send({
            message: 'Apenas administradores podem deletar itens de equipamento.'
          })
        }

        // Buscar arquivos do grupo
        const groupFiles = await File.find({ where: { group: { id: groupUuid }  } })

        // Remover arquivos físicos do storage
        for (const file of groupFiles) {
          try {
            const folder = file.path.split('/').slice(0, -1).join('/')
            await storage.delete(file.filename, folder)
            console.log(`Arquivo físico removido: ${file.path}/${file.filename}`)
          } catch (error) {
            console.warn(`Erro ao remover arquivo físico ${file.filename}:`, error)
          }
        }

        // Deletar arquivos do banco
        if (groupFiles.length > 0) {
          await File.remove(groupFiles)
        }

        // Criar logs antes de deletar os itens
        for (const item of group.items) {
          await Log.create({
            code: 'item:deleted',
            data: { id: item.id, name: item.name, group: groupUuid, ownerId: request.user.id },
            user: { id: request.user.id }
          }).save()
        }

        // Deletar todos os itens do grupo
        await Item.remove(group.items)

        // Log do grupo deletado (metadados agregados)
        await Log.create({
          code: 'group:deleted',
          data: {
            id: groupUuid,
            ownerId: request.user.id,
            deletedItems: group.items.length,
            deletedFiles: groupFiles.length,
            name: group.name,
          },
          user: { id: request.user.id }
        }).save()

        return reply.code(200).send({
          message: `Grupo de ${group.items.length} item(s) e ${groupFiles.length} arquivo(s) deletado com sucesso`,
          data: {
            deletedItems: group.items.length,
            deletedFiles: groupFiles.length,
            groupUuid,
            items: group.items.map(item => ({
              id: item.id,
              name: item.name,
              status: item.status
            }))
          }
        })
      } catch (error) {
        console.error('Erro ao deletar grupo:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao deletar grupo'
        })
      }
    }
  }
})
