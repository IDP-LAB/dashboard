import { Group } from '@/database/entity/Group'
import { Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { hasItemPermission } from '@/helper/hasItemPermission'
import { Method } from '@asterflow/router'

export default new Method({
  name: 'Get Group Items',
  path: '/group/:groupUuid',
  method: 'get',
  description: 'Get all items in a group by group UUID.',
  // authenticate: true,
  handler: async ({ response, request, url }) => {
    const groupUuid = url.getParams().groupUuid
      
    try {
      // Buscar grupo e itens
      const group = await Group.findOne({
        where: { id: groupUuid },
        relations: { items: true, category: true, tags: true }
      })

      if (!group || group.items.length === 0) {
        return response.status(404).send({
          message: `Nenhum item encontrado no grupo ${groupUuid}`
        })
      }

      // Verificar permissão usando o primeiro item do grupo
      const [permission] = await hasItemPermission({
        userId: request.user.id,
        isAdmin: request.user.role === Role.Administrator,
        itemId: group.items[0].id,
        requiredPermission: PERMISSIONS.VIEWER,
      })

      if (!permission) return response.code(403).send({
        message: 'Você não tem permissão suficiente!'
      })

      const items = group.items.map((item) => ({
        ...item,
        // Compatibilidade: expor groupUuid, category e tags via Group
        groupUuid: group.id,
        category: group.category ?? null,
        tags: group.tags ?? [],
      }))

      return response.code(200).send({
        message: 'Itens do grupo recuperados com sucesso',
        data: items,
        metadata: {
          total: items.length,
          currentPage: 1,
          totalPages: 1,
          pageSize: items.length
        }
      })
    } catch (error) {
      console.error('Erro ao buscar itens do grupo:', error)
      return response.code(500).send({
        message: 'Erro interno do servidor ao buscar itens do grupo'
      })
    }
  }
})
