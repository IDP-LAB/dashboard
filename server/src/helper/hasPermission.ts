import { ProjectMembership } from '@/database/entity/ProjectMembership'

// Função para checar se um usuário tem uma permissão específica em um projeto
export async function hasPermission(userId: number, projectId: number, requiredPermission: number): Promise<boolean> {
  // 1. Busca a permissão do usuário para o projeto específico
  const membership = await ProjectMembership.findOne({
    where: {
      user: { id: userId },
      project: { id: projectId },
    },
  })

  if (!membership)  return false
  const userPermissionValue = membership.permission

  // 2. A mágica do bitwise AND
  // Exemplo: O usuário tem permissão 7 (READ|CREATE|UPDATE) e a ação requer UPDATE (4)
  // 7 em binário é 0111
  // 4 em binário é 0100
  // (0111 & 0100) resulta em 0100 (que é 4)
  // 4 === 4, então a permissão é concedida.
  
  // Exemplo 2: O usuário tem 7 e a ação requer DELETE (8)
  // 7 em binário é 0111
  // 8 em binário é 1000
  // (0111 & 1000) resulta em 0000 (que é 0)
  // 0 === 8 é falso, permissão negada.
  
  return (userPermissionValue & requiredPermission) === requiredPermission
}