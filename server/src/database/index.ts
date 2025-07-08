import dataSource from './dataSource.js'
import { Auth } from './entity/Auth.js'
import { Product } from './entity/Product.js'
import { ProductType } from './entity/ProductType.js'
import { Project } from './entity/Project.js'
import { Tag } from './entity/Tag.js'
import { User } from './entity/User.js'

export const authTreeRepository = dataSource.getTreeRepository(Auth)

export const repository = {
  user: dataSource.getRepository(User),
  product: dataSource.getRepository(Product),
  productType: dataSource.getRepository(ProductType),
  project: dataSource.getRepository(Project),
  tag: dataSource.getRepository(Tag),
  request: dataSource.getRepository(Request),
  auth: dataSource.getRepository(Auth),
}
