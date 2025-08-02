export type { Routers } from './rpc'
export type { User } from '../src/database/entity/User'
export * from '../src/types/router'
export * from '../src/database/enums'

import type { EntityProperties } from '@/types/typeorm'
import type { Item } from '../src/database/entity/Item'

export type ItemProperties = EntityProperties<Item>