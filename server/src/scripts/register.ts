import { isDev } from '@/utils/dev'
import { fixItemsStatusByProjectAssociation, registerItems } from './items.js'
import { registerProjects } from './projects.js'
import { registerUsers } from './users.js'

if (isDev) {
  console.log('🌱 Iniciando script de registro de dados (seeding)...')
  
  await registerUsers()
  await registerItems()
  await registerProjects()
  await fixItemsStatusByProjectAssociation()
  
  console.log('🏁 Script de seeding finalizado.')
}