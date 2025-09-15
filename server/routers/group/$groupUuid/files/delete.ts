import { Router } from '@/controllers/router'
import { File } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { storage } from '@/index'

export default new Router({
  name: 'Delete Group File',
  path: '/group/:groupUuid/files/:fileId',
  description: 'Delete a file from a group',
  authenticate: true,
  methods: {
    async delete({ reply, request }) {
      const params = request.params as { groupUuid: string, fileId: string }
      const { groupUuid, fileId } = params
      
      try {
        // Buscar o arquivo
        const file = await File.findOne({
          where: { 
            id: parseInt(fileId),
          }
          , relations: { group: true } })

        if (!file) {
          return reply.status(404).send({
            message: `Arquivo não encontrado no grupo ${groupUuid}`
          })
        }

        // Verificar se o grupo existe e se o usuário tem permissão
        const group = await Group.findOne({ where: { id: groupUuid }, relations: { items: true } })

        if (!group || group.items.length === 0) {
          return reply.status(404).send({
            message: `Grupo ${groupUuid} não encontrado`
          })
        }

        // Verificar permissão usando um item do grupo
        const [permission] = await hasItemPermission({
          userId: request.user.id,
          isAdmin: request.user.role === Role.Administrator,
          itemId: group.items[0].id,
          requiredPermission: PERMISSIONS.EDITOR,
        })

        if (!permission) {
          return reply.code(403).send({
            message: 'Você não tem permissão suficiente!'
          })
        }

        // Remover arquivo físico do storage
        try {
          await storage.delete(file.filename, file.path)
          console.log(`Arquivo físico removido: ${file.path}/${file.filename}`)
        } catch (error) {
          console.warn(`Erro ao remover arquivo físico ${file.filename}:`, error)
        }

        // Remover registro do banco
        await file.remove()

        return reply.code(200).send({
          message: 'Arquivo removido com sucesso',
          data: {
            id: file.id,
            filename: file.originalName
          }
        })
      } catch (error) {
        console.error('Erro ao deletar arquivo:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao deletar arquivo'
        })
      }
    }
  }
}) 