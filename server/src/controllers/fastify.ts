import { fastifyCompress } from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import fastify, { type FastifyInstance } from 'fastify'
import fastifyIO from 'fastify-socket.io'
import { constants as zlibConstants } from 'zlib'

import { BearerStrategy } from '@/strategies/BearerStrategy.js'
import { CookiesStrategy } from '@/strategies/CookiesStrategy.js'

interface Options {
  host: string
  port: number
  log?: boolean
}

export class Fastify {
  static server: FastifyInstance
  constructor(public options: Options){}

  config () {
    const cookieToken = process.env['COOKIE_TOKEN']
    if (cookieToken === undefined) throw new Error('Cookie token are undefined')

    Fastify.server = fastify({
      logger: this.options.log === undefined ? undefined : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,reqId',
          },
        },
      },
    })
      .register(fastifyCors, {
        origin: (origin, callback) => {
          // Permitir requisições sem origin (Postman, mobile apps, etc.)
          if (!origin) return callback(null, true)
          
          // Lista de origens permitidas
          const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
          ]
          
          // Verificar se é uma origem permitida ou se FRONT_END_URL está definido
          if (process.env.FRONT_END_URL === origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
          }
          
          // Rejeitar outras origens
          callback(new Error('Not allowed by CORS'), false)
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        optionsSuccessStatus: 200 // Para suportar browsers legados
      })
      .register(fastifyCompress, {
        logLevel: 'debug',
        brotliOptions: {
          params: {
            [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
            [zlibConstants.BROTLI_PARAM_QUALITY]: 11
          }
        },
        zlibOptions: {
          level: 9,
        }
      })
      .register(fastifyMultipart, {
        limits: {
          fileSize: 1024 * 1024 * 500 // 500 Mb
        },
      })
      .register(fastifyCookie, {
        secret: cookieToken,
      })
      .register(fastifyIO, {
        async allowRequest(req, fn) {
          const strategy = new BearerStrategy()
          await strategy.validation(req)

          if (strategy.authenticated) return fn(undefined, true)
          fn(strategy.error?.message, false)
        },
      })
      .decorate('auth', {
        strategies: [
          BearerStrategy,
          CookiesStrategy
        ]
      })

    return this
  }

  async listen () {
    if (Fastify.server == undefined) throw new Error('Server not configured!')

    await new Promise<void>((resolve) => {
      Fastify.server.listen({
        port: this.options.port,
        host: this.options.host
      }, (err) => {
        if (err === null) return resolve()
        console.log(`Port unavailable: ${this.options.port}`)
        console.log(err)
        this.options.port = this.options.port + 1
        return this.listen()
      })
    }) 
  }
}