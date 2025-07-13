import { User } from '@/database/entity/User'
import { Role } from '@/database/enums'
import { faker } from '@faker-js/faker'

export async function registerUsers() {
  if (!(await User.findOneBy({ email: 'admin@admin.com' }))) {
    await (await User.create({
      name: 'Admin Principal',
      username: 'admin',
      email: 'admin@admin.com',
      language: 'pt-BR',
      role: Role.Administrator
    })
      .setPassword('admin1234'))
      .save()
    console.log('✓ Usuário Administrador criado.')
  }

  if (!(await User.findOneBy({ email: 'user@user.com' }))) {
    await (await User.create({
      name: 'Usuário de Teste',
      username: 'user',
      email: 'user@user.com',
      language: 'pt-BR',
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
        await (await User.create(u).setPassword(u.password)).save()
      }
    }
    console.log(`✓ ${toGenerate} usuários falsos criados.`)
  }
}