import { File } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { storage } from '@/index'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Delete Group File',
  path: '/group/:groupUuid/files/:fileId=number',
  description: 'Delete a file from a group',
  method: 'delete',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const { fileId, groupUuid } = url.getParams()
      
    try {
      // Buscar o arquivo
      const file = await File.findOne({
        where: { id: fileId },
        relations: { group: true } })

      if (!file) return response.status(404).send({
        message: `Arquivo não encontrado no grupo ${groupUuid}`
      })

      // Verificar se o grupo existe e se o usuário tem permissão
      const group = await Group.findOne({ where: { id: groupUuid }, relations: { items: true } })

      if (!group || group.items.length === 0) {
        return response.status(404).send({
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

      if (!permission) return response.code(403).send({
        message: 'Você não tem permissão suficiente!'
      })

      // Remover arquivo físico do storage
      try {
        await storage.delete(file.filename, file.path)
        console.log(`Arquivo físico removido: ${file.path}/${file.filename}`)
      } catch (error) {
        console.warn(`Erro ao remover arquivo físico ${file.filename}:`, error)
      }

      // Remover registro do banco
      await file.remove()

      return response.code(200).send({
        message: 'Arquivo removido com sucesso',
        data: {
          id: file.id,
          filename: file.originalName
        }
      })
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao deletar arquivo'
      })
    }
  }
}) 