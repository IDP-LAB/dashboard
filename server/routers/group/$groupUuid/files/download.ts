import { File } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { storage } from '@/index'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Download Group File',
  path: '/group/:groupUuid/files/:fileId=number/download',
  description: 'Download a file from a group',
  method: 'get',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const { groupUuid, fileId } = url.getParams()
      
    try {
      // Buscar o arquivo
      const file = await File.findOne({ where: { id: fileId }, relations: { group: true } })

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
        requiredPermission: PERMISSIONS.VIEWER,
      })

      if (!permission)  return response.code(403).send({
        message: 'Você não tem permissão suficiente!'
      })

      // Buscar arquivo no storage usando stream
      try {
        const fileStream = await storage.stream(file.filename, file.path)
          
        // Configurar headers para download
        response.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`)
        response.setHeader('Content-Type', file.mimeType)
        response.setHeader('Content-Length', file.size.toString())
          
        // Pipe do stream diretamente para a response
        return response.type(file.mimeType).send(fileStream)
      } catch (error) {
        console.error(`Erro ao buscar arquivo ${file.filename}:`, error)
        return response.status(404).send({
          message: 'Arquivo físico não encontrado no storage'
        })
      }
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao fazer download do arquivo'
      })
    }
  }
}) 