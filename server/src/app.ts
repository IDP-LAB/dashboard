import 'dotenv/config'
import 'env/loader'
import 'reflect-metadata'

import { AsterFlow } from 'asterflow'
import { adapters } from '@asterflow/adapter'
import fs from '@asterflow/fs'
import Database from './database/dataSource.js'
import fastify from 'fastify'
import { routerPath } from './index.js'

const server = fastify()
const aster = new AsterFlow({
  driver: adapters.fastify
}).use(fs, { path: routerPath })

await Database.initialize()

await import('./scripts/register.js')

aster.listen(server, { port: 3500 }, (error, address) => {
  if (error) {
    throw error
  }

  console.log(`Listening ${address}`)
})
