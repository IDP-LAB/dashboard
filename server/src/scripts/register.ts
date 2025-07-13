import { isDev } from '@/utils/dev'
import { registerItems } from './items.js' // Importar o novo script de itens
import { registerProjects } from './projects.js'
import { registerUsers } from './users.js'

if (isDev) {
  console.log('🌱 Iniciando script de registro de dados (seeding)...')
  
  await registerUsers()
  await registerItems()
  await registerProjects()
  
  console.log('🏁 Script de seeding finalizado.')
}