import AddGroupQuantity from '../routers/group/$groupUuid/add-quantity.js'
import APIRoot from '../routers/index.js'
import Categories from '../routers/category/index.js'
import ConsumeItemByGroup from '../routers/item/consume.js'
import CreateItem from '../routers/item/create.js'
import CreateProject from '../routers/project/create.js'
import CreateUser from '../routers/users/create.js'
import DeleteGroup from '../routers/group/$groupUuid/delete.js'
import DeleteGroupFile from '../routers/group/$groupUuid/files/delete.js'
import DeleteItem from '../routers/item/$id/delete.js'
import DeleteProject from '../routers/project/$id/delete.js'
import DeleteUser from '../routers/users/$id/delete.js'
import DownloadGroupFile from '../routers/group/$groupUuid/files/download.js'
import EditGroupItems from '../routers/group/$groupUuid/edit.js'
import EditItem from '../routers/item/$id/edit.js'
import EditProject from '../routers/project/$id/edit.js'
import EditUser from '../routers/users/$id/edit.js'
import FindandTransferItem from '../routers/item/transfer.js'
import GetGroupFiles from '../routers/group/$groupUuid/files/index.js'
import GetGroupItems from '../routers/group/$groupUuid/index.js'
import GetItem from '../routers/item/$id/get.js'
import GetProject from '../routers/project/$id/get.js'
import GetUser from '../routers/users/$id/get.js'
import GetUserProfile from '../routers/users/profile.js'
import ListItems from '../routers/item/index.js'
import ListProjects from '../routers/project/index.js'
import ListUsers from '../routers/users/index.js'
import ReturnItemByGroup from '../routers/item/return.js'
import Tags from '../routers/tag/index.js'
import TokenRefresh from '../routers/auth/refresh.js'
import UploadGroupFiles from '../routers/group/$groupUuid/files/upload.js'
import UserAuthentication from '../routers/auth/login.js'
import UserLogout from '../routers/auth/logout.js'

export const routers = {
  '/': APIRoot,
  '/auth/login': UserAuthentication,
  '/auth/logout': UserLogout,
  '/auth/refresh': TokenRefresh,
  '/category': Categories,
  '/group/:groupUuid': [DeleteGroup, GetGroupItems],
  '/group/:groupUuid/add-quantity': AddGroupQuantity,
  '/group/:groupUuid/edit': EditGroupItems,
  '/group/:groupUuid/files': [GetGroupFiles, UploadGroupFiles],
  '/group/:groupUuid/files/:fileId': DeleteGroupFile,
  '/group/:groupUuid/files/:fileId/download': DownloadGroupFile,
  '/item': [CreateItem, ListItems],
  '/item/:id': [DeleteItem, EditItem, GetItem],
  '/item/consume': ConsumeItemByGroup,
  '/item/return': ReturnItemByGroup,
  '/item/transfer': FindandTransferItem,
  '/project': [CreateProject, ListProjects],
  '/project/:id': [DeleteProject, EditProject, GetProject],
  '/tag': Tags,
  '/users': [CreateUser, ListUsers],
  '/users/:id': [DeleteUser, EditUser, GetUser],
  '/users/profile': GetUserProfile
}
