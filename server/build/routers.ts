import APIRoot from '../routers/index.js'
import ConsumeItemByGroup from '../routers/item/consume.js'
import CreateItem from '../routers/item/create.js'
import CreateProduct from '../routers/products/create.js'
import CreateProject from '../routers/project/create.js'
import CreateUser from '../routers/users/create.js'
import DeleteItem from '../routers/item/$id/delete.js'
import DeleteProject from '../routers/project/$id/delete.js'
import DeleteUser from '../routers/users/$id/delete.js'
import EditItem from '../routers/item/$id/edit.js'
import EditProject from '../routers/project/$id/edit.js'
import EditUser from '../routers/users/$id/edit.js'
import FindandTransferItem from '../routers/item/transfer.js'
import GetItem from '../routers/item/$id/get.js'
import GetProject from '../routers/project/$id/get.js'
import GetTags from '../routers/products/tags.js'
import GetUser from '../routers/users/$id/get.js'
import GetUserProfile from '../routers/users/profile.js'
import ListItems from '../routers/item/index.js'
import ListProducts from '../routers/products/index.js'
import ListProjects from '../routers/project/index.js'
import ListUsers from '../routers/users/index.js'
import ReturnItemByGroup from '../routers/item/return.js'
import TokenRefresh from '../routers/auth/refresh.js'
import UserAuthentication from '../routers/auth/login.js'
import UserLogout from '../routers/auth/logout.js'

export const routers = {
  '/': APIRoot,
  '/auth/login': UserAuthentication,
  '/auth/logout': UserLogout,
  '/auth/refresh': TokenRefresh,
  '/item': [CreateItem, ListItems],
  '/item/:id': [DeleteItem, EditItem, GetItem],
  '/item/consume': ConsumeItemByGroup,
  '/item/return': ReturnItemByGroup,
  '/item/transfer': FindandTransferItem,
  '/products': [CreateProduct, ListProducts],
  '/products/tags': GetTags,
  '/project': [CreateProject, ListProjects],
  '/project/:id': [DeleteProject, EditProject, GetProject],
  '/users': [CreateUser, ListUsers],
  '/users/:id': [DeleteUser, EditUser, GetUser],
  '/users/profile': GetUserProfile
}
