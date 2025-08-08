import { Router } from '@/controllers/router'
import { File } from '@/database/entity/File'
import { Group } from '@/database/entity/Group'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'

export default new Router({
  name: 'Get Group Files',
  path: '/group/:groupUuid/files',
  description: 'Get all files associated with a group',
  authenticate: true,
  methods: {
    async get({ reply, request }) {
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
          requiredPermission: PERMISSIONS.VIEWER,
        })

        if (!permission) {
          return reply.code(403).send({
            message: 'Você não tem permissão suficiente!'
          })
        }

        // Buscar todos os arquivos do grupo
        const files = await File.find({
          where: { group: { id: groupUuid }  },
          order: { createdAt: 'DESC' },
          relations: { group: false }
        })

        return reply.code(200).send({
          message: 'Arquivos do grupo recuperados com sucesso',
          data: files
        })
      } catch (error) {
        console.error('Erro ao buscar arquivos do grupo:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao buscar arquivos do grupo'
        })
      }
    }
  }
}) 