import { Router } from '@/controllers/router'
import { File, FileType } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { storage } from '@/index'
import { nanoid } from 'nanoid'

export default new Router({
  name: 'Upload Group Files',
  path: '/group/:groupUuid/files',
  description: 'Upload files to a group',
  authenticate: true,
  methods: {
    async post({ reply, request }) {
      const params = request.params as { groupUuid: string }
      const { groupUuid } = params
      
      try {
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

        // Processar arquivos enviados
        const parts = request.parts()
        const uploadedFiles: File[] = []
        
        for await (const part of parts) {
          if (part.type === 'file' && part.filename) {
            // Gerar nome único para o arquivo
            const fileExtension = part.filename.split('.').pop() || ''
            const uniqueFilename = `${nanoid()}.${fileExtension}`
            
            // Determinar tipo do arquivo
            const isImage = part.mimetype?.startsWith('image/')
            const fileType = isImage ? FileType.Photo : FileType.Document
            
            // Definir pasta baseada no tipo
            const folder = `groups/${groupUuid}/${fileType === FileType.Photo ? 'photos' : 'documents'}`
            
            // Converter stream para buffer
            const buffer = await part.toBuffer()
            
            // Salvar arquivo no storage
            await storage.save(uniqueFilename, buffer, { folder })
            
            // Criar registro no banco
            const fileRecord = File.create({
              filename: uniqueFilename,
              originalName: part.filename,
              mimeType: part.mimetype || 'application/octet-stream',
              size: buffer.length,
              type: fileType,
              path: folder,
              group
            })
            
            const savedFile = await fileRecord.save()
            uploadedFiles.push(savedFile)
          }
        }

        if (uploadedFiles.length === 0) {
          return reply.code(400).send({
            message: 'Nenhum arquivo válido foi enviado'
          })
        }

        return reply.code(201).send({
          message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
          data: uploadedFiles,
          metadata: {
            total: uploadedFiles.length,
            currentPage: 1,
            totalPages: 1,
            pageSize: uploadedFiles.length
          }
        })
      } catch (error) {
        console.error('Erro ao fazer upload dos arquivos:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao fazer upload dos arquivos'
        })
      }
    }
  }
}) 