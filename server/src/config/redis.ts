import { Redis } from 'ioredis'

export const redisConfig = {
  host: String(process.env.REDIS_HOST || 'localhost'),
  port: parseInt(String(process.env.REDIS_PORT || '6379')),
  password: process.env.REDIS_PASSWORD ? String(process.env.REDIS_PASSWORD) : undefined,
  db: parseInt(String(process.env.REDIS_DB || '0')),
  retryDelayOnFailover: 1000,
  maxRetriesPerRequest: 5,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 30000,
  commandTimeout: 30000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: true,
  maxLoadingTimeout: 30000,
}

export const createRedisConnection = (): Redis => {
  const redis = new Redis({
    ...redisConfig,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 60000,
    commandTimeout: 60000
  })
  
  redis.on('connect', () => console.log('✅ Redis conectado com sucesso'))
  redis.on('error', (error) => console.error('❌ Erro na conexão Redis:', error))
  redis.on('close', () => console.log('🔌 Conexão Redis fechada'))
  redis.on('reconnecting', () => console.log('🔄 Reconectando ao Redis...'))
  
  return redis
}