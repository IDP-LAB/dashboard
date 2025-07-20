import dataSource from './dataSource.js'
import { Auth } from './entity/Auth.js'
import { Item } from './entity/Item.js'
import { ItemTag } from './entity/ItemTag.js'
import { Project } from './entity/Project.js'
import { User } from './entity/User.js'

export const authTreeRepository = dataSource.getTreeRepository(Auth)

export const repository = {
  user: dataSource.getRepository(User),
  project: dataSource.getRepository(Project),
  tag: dataSource.getRepository(ItemTag),
  request: dataSource.getRepository(Request),
  auth: dataSource.getRepository(Auth),
  item: dataSource.getRepository(Item),
}
