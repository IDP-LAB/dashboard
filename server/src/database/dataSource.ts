import 'dotenv/config'
import { dirname, join } from 'path'
import { DataSource } from 'typeorm'
import { fileURLToPath } from 'url'

const path = dirname(fileURLToPath(import.meta.url))

async function getDatabase(database: 'mysql' | 'sqljs' = 'sqljs') {
  switch (database) {
  case 'mysql': {
    const host = String(process.env.DATABASE_HOST || 'localhost')
    const port = Number(process.env.DATABASE_PORT || 3306)
    const username = String(process.env.DATABASE_USERNAME || 'root')
    const password = String(process.env.DATABASE_PASSWORD || '')
    const database = String(process.env.DATABASE_NAME || '')

    return {
      type: 'mysql' as const,
      host,
      port,
      username,
      password,
      database,
      charset: 'utf8mb4',
    }
  }
  default: {
    return {
      type: 'sqljs' as const,
      autoSave: true,
      useLocalForage: true,
      location: String(process.env.DATABASE_FILE || 'database.wm'),
    }
  }
  }
}

export default new DataSource({
  ...(await getDatabase(process.env.DATABASE_TYPE as 'mysql' | 'sqljs' | undefined)),
  synchronize: true,
  // logging: true,
  entities: [join(path, 'entity', '**', '*.{js,ts}')],
  migrations: [join(path, 'migration', '**', '*.{js,ts}')],
})