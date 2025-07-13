import { Item } from '@/database/entity/Item'
import { ItemMovement } from '@/database/entity/ItemMovement'
import { Project } from '@/database/entity/Project'
import { ProjectMembership } from '@/database/entity/ProjectMembership'
import { User } from '@/database/entity/User'
import { ItemStatus, MovementType, ProjectStatus, Role } from '@/database/enums'
import { PERMISSIONS } from '@/database/permissions'
import { fakerPT_BR as faker } from '@faker-js/faker'

const NUM_PROJECTS = 4

/**
 * Cria um novo projeto com um proprietário e membros aleatórios.
 */
async function createProjectWithMembers(allUsers: User[]): Promise<Project> {
  const projectMembers = faker.helpers.arrayElements(
    allUsers.filter(u => u.role !== Role.Administrator), 
    { min: 2, max: 5 }
  )
  
  const [owner, ...members] = projectMembers

  const project = await Project.create({
    name: `Projeto ${faker.commerce.department()}`,
    owner,
    status: faker.helpers.arrayElement(Object.values(ProjectStatus)),
  }).save()
  console.log(`\n↳ Projeto "${project.name}" criado (Proprietário: ${owner.name}).`)

  if (members.length > 0) {
    const membershipsToCreate = members.map(user => 
      ProjectMembership.create({
        name: user.name,
        permission: PERMISSIONS.EDITOR,
        user,
        project
      })
    )
    await ProjectMembership.save(membershipsToCreate)
  }
  console.log(`  - ${members.length} membro(s) associado(s) ao projeto.`)
  
  return project
}

/**
 * Pega itens disponíveis no estoque e os atribui a um projeto, registrando o movimento.
 */
async function assignAvailableItemsToProject(project: Project, adminUser: User | undefined) {
  if (!adminUser) {
    console.warn('  - ⚠️ Nenhum usuário admin encontrado para registrar o movimento de itens.')
    return
  }

  const availableItems = await Item.find({ 
    where: { status: ItemStatus.Available, project: { id: undefined } } // Encontra itens sem projeto
  })

  if (availableItems.length === 0) {
    console.warn(`  - ⚠️ Não há itens disponíveis no estoque para alocar ao projeto "${project.name}".`)
    return
  }

  const itemsToAssign = faker.helpers.arrayElements(availableItems, { min: 1, max: Math.min(5, availableItems.length) })
  
  const updatedItems: Item[] = []
  const newMovements: ItemMovement[] = []

  for (const item of itemsToAssign) {
    item.project = project
    item.status = ItemStatus.InUse
    updatedItems.push(item)

    newMovements.push(ItemMovement.create({
      item,
      project,
      user: adminUser,
      type: MovementType.Transfer_Out,
      notes: 'Alocação inicial de item para o projeto via script de seeding.'
    }))
  }

  await Item.save(updatedItems)
  await ItemMovement.save(newMovements)

  console.log(`  - ${itemsToAssign.length} itens do estoque foram alocados para o projeto.`)
}

/**
 * Função principal para popular o banco de dados com projetos.
 * O script só é executado se não houver projetos existentes.
 */
export async function registerProjects() {
  const projectCount = await Project.count()
  if (projectCount > 0) {
    console.log(`ℹ️ ${projectCount} projeto(s) já existem. O script de criação de projetos foi ignorado.`)
    return
  }

  console.log(`Nenhum projeto encontrado. Criando ${NUM_PROJECTS} projetos de teste...`)

  const allUsers = await User.find()
  const adminUser = allUsers.find(u => u.role === Role.Administrator)

  for (let i = 0; i < NUM_PROJECTS; i++) {
    const project = await createProjectWithMembers(allUsers)
    await assignAvailableItemsToProject(project, adminUser)
  }

  console.log('\n✓ Todos os projetos e dados associados foram criados com sucesso!')
}