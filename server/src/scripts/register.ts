// server/src/scripts/register.ts
import { Product } from '@/database/entity/Product'
import { ProductType } from '@/database/entity/ProductType'
import { Project } from '@/database/entity/Project'
import { ProjectMembership } from '@/database/entity/ProjectMembership'
import { User } from '@/database/entity/User'
import { ProjectStatus, Role } from '@/database/enums'
import { isDev } from '@/utils/dev'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'

if (isDev) {
  console.log('🌱 Iniciando script de registro de dados (seeding)...')

  // =================================================================
  // 1. CRIAÇÃO DE USUÁRIOS
  // =================================================================
  let adminUser = await User.findOneBy({ email: 'admin@admin.com' })
  if (!adminUser) {
    adminUser = await (await User.create({
      name: 'Admin Principal',
      username: 'admin',
      email: 'admin@admin.com',
      language: 'pt-BR',
      uuid: nanoid(),
      role: Role.Administrator
    })
      .setPassword('admin1234'))
      .save()
    console.log('✓ Usuário Administrador criado.')
  }

  let testUser = await User.findOneBy({ email: 'user@user.com' })
  if (!testUser) {
    testUser = await (await User.create({
      name: 'Usuário de Teste',
      username: 'user',
      email: 'user@user.com',
      language: 'pt-BR',
      uuid: nanoid(),
      role: Role.User,
    })
      .setPassword('user1234'))
      .save()
    console.log('✓ Usuário de Teste criado.')
  }

  const totalUsers = await User.count()
  const MAX_USERS = 20

  if (totalUsers < MAX_USERS) {
    const toGenerate = MAX_USERS - totalUsers
    console.log(`Gerando ${toGenerate} usuários falsos...`)

    const fakeUsersData = Array.from({ length: toGenerate }).map(() => ({
      name: faker.person.fullName(),
      username: faker.internet.userName().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      language: faker.helpers.arrayElement(['pt-BR', 'en-US']),
      role: Role.User,
      password: 'password123'
    }))

    for (const u of fakeUsersData) {
      const exists = await User.findOneBy({ email: u.email })
      if (!exists) {
        await (await User.create({ ...u, uuid: nanoid() }).setPassword(u.password)).save()
      }
    }
    console.log(`✓ ${toGenerate} usuários falsos criados.`)
  }

  // Pega todos os usuários do banco para usar nas associações
  const allUsers = await User.find()

  // =================================================================
  // 2. CRIAÇÃO DE TIPOS DE PRODUTO
  // =================================================================
  let productTypes = await ProductType.find()
  if (productTypes.length === 0) {
    console.log('Criando Tipos de Produto...')
    const types = [
      'Eletrônicos',
      'Mobiliário',
      'Ferramentas',
      'Material de Escritório',
      'Componentes'
    ]

    for (const type of types) {
      await ProductType.create({ name: type }).save()
    }

    productTypes = await ProductType.find()
    console.log('✓ Tipos de Produto criados.')
  }

  // =================================================================
  // 3. CRIAÇÃO DE PROJETOS, PRODUTOS E ASSOCIAÇÕES
  // =================================================================
  const projectCount = await Project.count()
  const NUM_PROJECTS = 4

  if (projectCount === 0) {
    console.log(`Nenhum projeto encontrado. Criando ${NUM_PROJECTS} projetos...`)

    for (let i = 0; i < NUM_PROJECTS; i++) {
      // --- CRIAÇÃO DO PROJETO ---
      const project = await Project.create({
        name: `Projeto ${faker.commerce.department()} ${faker.word.adjective()}`,
        status: faker.helpers.arrayElement([ProjectStatus.InProgress, ProjectStatus.Completed, ProjectStatus.OnHold]),
      }).save()
      console.log(`\n↳ Projeto "${project.name}" criado.`)

      // --- ASSOCIAÇÃO DE USUÁRIOS AO PROJETO ---
      const usersForProject = new Set<User>()
      // Garante que o admin esteja em todos os projetos
      if (adminUser) usersForProject.add(adminUser)
      // Adiciona entre 2 e 5 usuários aleatórios ao projeto
      const randomUsers = faker.helpers.arrayElements(allUsers.filter(u => u.id !== adminUser?.id), faker.number.int({ min: 2, max: 5 }))
      randomUsers.forEach(user => usersForProject.add(user))

      for (const user of usersForProject) {
        await ProjectMembership.create({
          name: user.name, // Nome do membro no projeto
          permission: user.role === Role.Administrator ? 10 : 1, // Permissão maior para admin
          user,
          project
        }).save()
      }
      console.log(`  - ${usersForProject.size} usuários associados ao projeto.`)

      // --- CRIAÇÃO DE PRODUTOS PARA O PROJETO ---
      const numProducts = faker.number.int({ min: 3, max: 8 })
      const productsToCreate: Partial<Product>[] = []

      for (let j = 0; j < numProducts; j++) {
        productsToCreate.push({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          location: faker.location.streetAddress(),
          quantity: faker.number.int({ min: 1, max: 200 }),
          type: faker.helpers.arrayElement(productTypes),
          project: project // Associação com o projeto atual
        })
      }
      await Product.save(productsToCreate)
      console.log(`  - ${numProducts} produtos registrados no projeto.`)
    }
    console.log('\n✓ Todos os projetos e dados associados foram criados com sucesso!')
  } else {
    console.log(`ℹ️ ${projectCount} projetos já existem. O script de criação de projetos foi ignorado.`)
  }

  console.log('🏁 Script de seeding finalizado.')
}