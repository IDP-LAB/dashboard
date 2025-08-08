import { Router } from '@/controllers/router'
import { Item } from '@/database/entity/Item'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'

export default new Router({
  name: 'Get Item',
  path: '/item/:id',
  description: 'Get individual item information by ID.',
  authenticate: true,
  methods: {
    async get({ reply, request }) {
      const params = request.params as { id: string }
      const itemId = Number(params.id)
      
      const [permission, item] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId,
        requiredPermission: PERMISSIONS.VIEWER,
      })
      
      if (!item) return reply.status(404).send({
        message: `Item com ID ${params.id} não encontrado`
      })

      if (!permission) return reply.code(403).send({
        message: 'Você não tem permissão suficiente!'
      })

      try {
        // Recarregar o item com relações para exibição completa
        const fullItem = await Item.findOne({
          where: { id: item.id },
          relations: {
            group: { category: true, tags: true },
            project: { owner: true, memberships: { user: true } },
            movements: { project: true, user: true },
          },
        })

        return reply.code(200).send({
          message: 'Detalhes do item recuperados com sucesso',
          data: fullItem ?? item
        })
      } catch (error) {
        console.error('Erro ao buscar item:', error)
        return reply.code(500).send({
          message: 'Erro interno do servidor ao buscar item'
        })
      }
    }
  }
}) 