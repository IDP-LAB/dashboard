export type TProcessEnv = {
  PRODUCTION: boolean
  PORT: number
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_PASSWORD: number
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_SECURE: boolean
  SMTP_TLS_REJECT_UNAUTHORIZED: boolean
  DATABASE_TYPE: string
  DATABASE_FILE: string
  JWT_TOKEN: string
  JWT_EXPIRE: string
  REFRESH_TOKEN: string
  REFRESH_EXPIRE: string
  COOKIE_TOKEN: string
  FRONT_END_URL: string
  STORAGE_TYPE: string
  LOCAL_STORAGE_PATH: string
}

type Generic = Dict<string | number | boolean>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Generic, TProcessEnv {}
  }
}

export {}