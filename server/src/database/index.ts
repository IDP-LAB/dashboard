import dataSource from './dataSource.js'
import { Auth } from './entity/Auth.js'
import { Item } from './entity/Item.js'
import { ItemTag } from './entity/ItemTag.js'
import { Project } from './entity/Project.js'
import { User } from './entity/User.js'
import { ItemMovement } from './entity/ItemMovement.js'
import { ItemCategory } from './entity/ItemCategory.js'
import { File } from './entity/File.js'
import { Group } from './entity/Group.js'

export const authTreeRepository = dataSource.getTreeRepository(Auth)

export const repository = {
  user: dataSource.getRepository(User),
  project: dataSource.getRepository(Project),
  tag: dataSource.getRepository(ItemTag),
  auth: dataSource.getRepository(Auth),
  item: dataSource.getRepository(Item),
  file: dataSource.getRepository(File),
  itemCategory: dataSource.getRepository(ItemCategory),
  group: dataSource.getRepository(Group),
}

export * from './entity/Auth.js'
export * from './entity/Item.js'
export * from './entity/ItemTag.js'
export * from './entity/ItemCategory.js'
export * from './entity/ItemMovement.js'
export * from './entity/Project.js'
export * from './entity/User.js'
export * from './entity/File.js'
export * from './entity/Group.js'
export * from './dataSource.js'
export * from './enums.js'
