// src/database/locking.ts

import dataSource from './dataSource'

/**
 * Verifica se o driver de banco de dados atual suporta locking pessimista.
 * Esta verificação é feita uma vez e o resultado é armazenado em cache.
 * 
 * Drivers que suportam locking incluem: mysql, postgres, mariadb, etc.
 * Drivers que NÃO suportam incluem: sqlite, sql.js.
 */
function checkLockingSupport(): boolean {
  const supportedDrivers = [
    'mysql',
    'postgres',
    'mariadb',
    'oracle',
    'mssql'
  ]
  const driverType = dataSource.options.type
  console.log(`ℹ️ Verificando suporte a locking para o driver: ${driverType}`)
  
  if (supportedDrivers.includes(driverType)) {
    console.log('  - ✅ Locking pessimista é suportado.')
    return true
  }

  console.log('  - ⚠️ Locking pessimista não é suportado. As transações dependerão da velocidade de execução.')
  return false
}

export const isLockingSupported = checkLockingSupport()

/**
 * Retorna as opções de locking para uma query do TypeORM se o driver atual suportar.
 * Caso contrário, retorna um objeto vazio.
 * 
 * @example
 * const item = await tm.getRepository(Item).findOne({
 *   where: { ... },
 *   ...getLockingOptions()
 * });
 */
export function getLockingOptions(): { lock?: { mode: 'pessimistic_write' } } {
  if (isLockingSupported) return { lock: { mode: 'pessimistic_write' } }
  return {}
}