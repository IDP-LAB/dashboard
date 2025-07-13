import { Project } from '@/database/entity/Project'

/**
 * Checa se um usuário tem uma permissão específica em um projeto.
 * O dono do projeto sempre terá permissão total.
 * @param userId - O ID do usuário a ser verificado.
 * @param projectId - O ID do projeto.
 * @param requiredPermission - A permissão necessária para a ação.
 * @returns {Promise<boolean>} - Retorna true se o usuário tiver a permissão, caso contrário, false.
 */
export async function hasProjectPermission({ projectId, requiredPermission, userId, isAdmin }: { userId: number, isAdmin?: boolean, projectId: number, requiredPermission: number }): Promise<[boolean, undefined | Project]> {
  const project = await Project.findOne({
    where: { id: projectId },
    relations: {
      owner: true,
      products: true,
      memberships: { user: true },
    },
  })

  // Se o projeto não for encontrado, o usuário não tem permissão.
  if (!project) return [false, undefined]
  if (isAdmin) return [true, project]

  // 1. Checagem de dono: se o ID do usuário corresponde ao ID do dono, a permissão é absoluta.
  if (project.owner && project.owner.id === userId) return [true, project]

  // 2. Checagem de membro: se não for o dono, verifica as permissões de membro.
  const membership = project.memberships.find(m => m.user && m.user.id === userId)

  // Se o usuário não for um membro, ele não tem permissão.
  if (!membership) return [false, undefined]

  // 3. A mágica do bitwise AND para verificar a permissão do membro.
  // Exemplo: O usuário tem permissão 7 (READ|CREATE|UPDATE) e a ação requer UPDATE (4)
  // 7 em binário é 0111
  // 4 em binário é 0100
  // (0111 & 0100) resulta em 0100 (que é 4)
  // Como o resultado é igual à permissão requerida, a permissão é concedida.
  return [(membership.permission & requiredPermission) === requiredPermission, project]
}