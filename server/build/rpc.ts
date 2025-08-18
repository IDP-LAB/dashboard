/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from 'zod'
import type { Router } from '../src/controllers/router.js'
import type AddGroupQuantity from '../routers/group/$groupUuid/add-quantity.js'
import type APIRoot from '../routers/index.js'
import type Categories from '../routers/category/index.js'
import type ConsumeItemByGroup from '../routers/item/consume.js'
import type CreateItem from '../routers/item/create.js'
import type CreateProject from '../routers/project/create.js'
import type CreateUser from '../routers/users/create.js'
import type DeleteGroup from '../routers/group/$groupUuid/delete.js'
import type DeleteGroupFile from '../routers/group/$groupUuid/files/delete.js'
import type DeleteItem from '../routers/item/$id/delete.js'
import type DeleteProject from '../routers/project/$id/delete.js'
import type DeleteUser from '../routers/users/$id/delete.js'
import type DownloadGroupFile from '../routers/group/$groupUuid/files/download.js'
import type EditGroupItems from '../routers/group/$groupUuid/edit.js'
import type EditItem from '../routers/item/$id/edit.js'
import type EditProject from '../routers/project/$id/edit.js'
import type EditUser from '../routers/users/$id/edit.js'
import type FindandTransferItem from '../routers/item/transfer.js'
import type GetGroupFiles from '../routers/group/$groupUuid/files/index.js'
import type GetGroupItems from '../routers/group/$groupUuid/index.js'
import type GetItem from '../routers/item/$id/get.js'
import type GetProject from '../routers/project/$id/get.js'
import type GetUser from '../routers/users/$id/get.js'
import type GetUserProfile from '../routers/users/profile.js'
import type ListItems from '../routers/item/index.js'
import type ListProjects from '../routers/project/index.js'
import type ListUsers from '../routers/users/index.js'
import type ReturnItemByGroup from '../routers/item/return.js'
import type Tags from '../routers/tag/index.js'
import type TokenRefresh from '../routers/auth/refresh.js'
import type UploadGroupFiles from '../routers/group/$groupUuid/files/upload.js'
import type UserAuthentication from '../routers/auth/login.js'
import type UserLogout from '../routers/auth/logout.js'
import type UserRegistration from '../routers/auth/signup.js'

type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer R) => void ? { [K in keyof R]: R[K] }: never
type UnwrapPromise<T> = T extends Promise<any> ? Awaited<T> : T
type FirstParameter<T> = T extends Router<infer First, any, any, any> ? First : never


export type Routers = {
  '/': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof APIRoot.methods.get>>>,
      request: undefined,
      auth: undefined
    }
  },
  '/auth/login': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof UserAuthentication.methods.post>>>,
      request: z.infer<NonNullable<typeof UserAuthentication.schema>['post']>,
      auth: undefined
    }
  },
  '/auth/logout': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof UserLogout.methods.post>>>,
      request: undefined,
      auth: FirstParameter<typeof UserLogout>
    }
  },
  '/auth/refresh': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof TokenRefresh.methods.post>>>,
      request: undefined,
      auth: undefined
    }
  },
  '/auth/signup/U4seYC7OYwkc3LlL': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof UserRegistration.methods.post>>>,
      request: z.infer<NonNullable<typeof UserRegistration.schema>['post']>,
      auth: undefined
    }
  },
  '/category': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof Categories.methods.delete>>>,
      request: undefined,
      auth: FirstParameter<typeof Categories>
    },
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof Categories.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof Categories>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof Categories.methods.post>>>,
      request: z.infer<NonNullable<typeof Categories.schema>['post']>,
      auth: FirstParameter<typeof Categories>
    },
    put: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof Categories.methods.put>>>,
      request: z.infer<NonNullable<typeof Categories.schema>['put']>,
      auth: FirstParameter<typeof Categories>
    }
  },
  '/group/:groupUuid': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof DeleteGroup.methods.delete>>>,
      request: z.infer<NonNullable<typeof DeleteGroup.schema>['delete']>,
      auth: FirstParameter<typeof DeleteGroup>
    },
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetGroupItems.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetGroupItems>
    }
  },
  '/group/:groupUuid/add-quantity': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof AddGroupQuantity.methods.post>>>,
      request: z.infer<NonNullable<typeof AddGroupQuantity.schema>['post']>,
      auth: FirstParameter<typeof AddGroupQuantity>
    }
  },
  '/group/:groupUuid/edit': {
    put: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof EditGroupItems.methods.put>>>,
      request: z.infer<NonNullable<typeof EditGroupItems.schema>['put']>,
      auth: FirstParameter<typeof EditGroupItems>
    }
  },
  '/group/:groupUuid/files': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetGroupFiles.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetGroupFiles>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof UploadGroupFiles.methods.post>>>,
      request: undefined,
      auth: FirstParameter<typeof UploadGroupFiles>
    }
  },
  '/group/:groupUuid/files/:fileId': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof DeleteGroupFile.methods.delete>>>,
      request: undefined,
      auth: FirstParameter<typeof DeleteGroupFile>
    }
  },
  '/group/:groupUuid/files/:fileId/download': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof DownloadGroupFile.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof DownloadGroupFile>
    }
  },
  '/item': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ListItems.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof ListItems>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof CreateItem.methods.post>>>,
      request: undefined,
      auth: FirstParameter<typeof CreateItem>
    }
  },
  '/item/:id': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof DeleteItem.methods.delete>>>,
      request: z.infer<NonNullable<typeof DeleteItem.schema>['delete']>,
      auth: FirstParameter<typeof DeleteItem>
    },
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetItem.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetItem>
    },
    put: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof EditItem.methods.put>>>,
      request: z.infer<NonNullable<typeof EditItem.schema>['put']>,
      auth: FirstParameter<typeof EditItem>
    }
  },
  '/item/consume': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ConsumeItemByGroup.methods.post>>>,
      request: z.infer<NonNullable<typeof ConsumeItemByGroup.schema>['post']>,
      auth: FirstParameter<typeof ConsumeItemByGroup>
    }
  },
  '/item/return': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ReturnItemByGroup.methods.post>>>,
      request: z.infer<NonNullable<typeof ReturnItemByGroup.schema>['post']>,
      auth: FirstParameter<typeof ReturnItemByGroup>
    }
  },
  '/item/transfer': {
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof FindandTransferItem.methods.post>>>,
      request: z.infer<NonNullable<typeof FindandTransferItem.schema>['post']>,
      auth: FirstParameter<typeof FindandTransferItem>
    }
  },
  '/project': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ListProjects.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof ListProjects>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof CreateProject.methods.post>>>,
      request: z.infer<NonNullable<typeof CreateProject.schema>['post']>,
      auth: FirstParameter<typeof CreateProject>
    }
  },
  '/project/:id': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof DeleteProject.methods.delete>>>,
      request: z.infer<NonNullable<typeof DeleteProject.schema>['delete']>,
      auth: FirstParameter<typeof DeleteProject>
    },
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetProject.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetProject>
    },
    put: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof EditProject.methods.put>>>,
      request: z.infer<NonNullable<typeof EditProject.schema>['put']>,
      auth: FirstParameter<typeof EditProject>
    }
  },
  '/tag': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof Tags.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof Tags>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof Tags.methods.post>>>,
      request: z.infer<NonNullable<typeof Tags.schema>['post']>,
      auth: FirstParameter<typeof Tags>
    }
  },
  '/users': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ListUsers.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof ListUsers>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof CreateUser.methods.post>>>,
      request: z.infer<NonNullable<typeof CreateUser.schema>['post']>,
      auth: FirstParameter<typeof CreateUser>
    }
  },
  '/users/:id': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof DeleteUser.methods.delete>>>,
      request: undefined,
      auth: FirstParameter<typeof DeleteUser>
    },
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetUser.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetUser>
    },
    put: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof EditUser.methods.put>>>,
      request: z.infer<NonNullable<typeof EditUser.schema>['put']>,
      auth: FirstParameter<typeof EditUser>
    }
  },
  '/users/profile': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetUserProfile.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetUserProfile>
    }
  }
}