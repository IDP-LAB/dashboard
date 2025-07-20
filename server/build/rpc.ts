/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from 'zod'
import type { Router } from '../src/controllers/router.js'
import type APIRoot from '../routers/index.js'
import type ConsumeItemByGroup from '../routers/item/consume.js'
import type CreateItem from '../routers/item/create.js'
import type CreateProduct from '../routers/products/create.js'
import type CreateProject from '../routers/project/create.js'
import type CreateUser from '../routers/users/create.js'
import type DeleteItem from '../routers/item/$id/delete.js'
import type DeleteProject from '../routers/project/$id/delete.js'
import type DeleteUser from '../routers/users/$id/delete.js'
import type EditItem from '../routers/item/$id/edit.js'
import type EditProject from '../routers/project/$id/edit.js'
import type EditUser from '../routers/users/$id/edit.js'
import type FindandTransferItem from '../routers/item/transfer.js'
import type GetItem from '../routers/item/$id/get.js'
import type GetProject from '../routers/project/$id/get.js'
import type GetTags from '../routers/products/tags.js'
import type GetUser from '../routers/users/$id/get.js'
import type GetUserProfile from '../routers/users/profile.js'
import type ListItems from '../routers/item/index.js'
import type ListProducts from '../routers/products/index.js'
import type ListProjects from '../routers/project/index.js'
import type ListUsers from '../routers/users/index.js'
import type ReturnItemByGroup from '../routers/item/return.js'
import type TokenRefresh from '../routers/auth/refresh.js'
import type UserAuthentication from '../routers/auth/login.js'
import type UserLogout from '../routers/auth/logout.js'

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
  '/item': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ListItems.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof ListItems>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof CreateItem.methods.post>>>,
      request: z.infer<NonNullable<typeof CreateItem.schema>['post']>,
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
  '/products': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof ListProducts.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof ListProducts>
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof CreateProduct.methods.post>>>,
      request: z.infer<NonNullable<typeof CreateProduct.schema>['post']>,
      auth: FirstParameter<typeof CreateProduct>
    }
  },
  '/products/tags': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof GetTags.methods.get>>>,
      request: undefined,
      auth: FirstParameter<typeof GetTags>
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