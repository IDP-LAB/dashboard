// server/src/helper/hasItemPermission.ts
import { Item } from '@/database/entity/Item'
import { type User } from '@/database/entity/User' // Opcional, mas bom para tipagem

/**
 * Checa se um usuário tem uma permissão específica para realizar uma ação em um Item.
 * A permissão é verificada através do Projeto ao qual o Item pertence.
 * O dono do projeto sempre terá permissão total.
 * @param userId - O ID do usuário a ser verificado.
 * @param itemId - O ID do item a ser verificado.
 * @param requiredPermission - A permissão necessária (bitwise) para a ação.
 * @param isAdmin - Flag para pular a verificação se o usuário for admin.
 * @returns {Promise<[boolean, Item | undefined]>} - Retorna um array onde o primeiro elemento é true se o usuário tiver a permissão, e o segundo é a instância do Item (se encontrado).
 */
export async function hasItemPermission({ itemId, requiredPermission, userId, isAdmin }: {
  userId: User['id'],
  isAdmin?: boolean,
  itemId: number,
  requiredPermission: number
}): Promise<[boolean, Item | undefined]> {
  // 1. Encontra o Item e carrega suas relações aninhadas:
  // Item -> Project -> Owner (User)
  // Item -> Project -> Memberships -> User
  const item = await Item.findOne({
    where: { id: itemId },
    relations: {
      project: {
        owner: true,
        memberships: {
          user: true
        }
      }
    }
  })

  // Se o item não for encontrado, o usuário não tem permissão.
  if (!item)  return [false, undefined]

  // Se o usuário é um admin, a permissão é concedida imediatamente.
  if (isAdmin) return [true, item]

  // Extrai o projeto do item para facilitar o acesso.
  const { project } = item

  // Se o item não pertence a um projeto, ele está disponivel.
  if (!project) return [true, item]

  // 2. Checagem de dono: se o ID do usuário corresponde ao ID do dono do projeto, a permissão é absoluta.
  if (project.owner?.id === userId) return [true, item]

  // 3. Checagem de membro: se não for o dono, verifica as permissões de membro no projeto.
  const membership = project.memberships.find(m => m.user?.id === userId)

  // Se o usuário não for um membro do projeto, ele não tem permissão no item.
  if (!membership) return [false, item]

  // 4. A mágica do bitwise AND para verificar a permissão do membro.
  // Exemplo: O usuário tem permissão 7 (READ|CREATE|UPDATE) e a ação requer UPDATE (4)
  // 7 em binário é 0111
  // 4 em binário é 0100
  // (0111 & 0100) resulta em 0100 (que é 4)
  // Como o resultado é igual à permissão requerida, a permissão é concedida.
  const hasPermission = (membership.permission & requiredPermission) === requiredPermission
  
  return [hasPermission, item]
}