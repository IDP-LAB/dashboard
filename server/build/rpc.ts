/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from 'zod'
import type { Router } from '../src/controllers/router.js'
import type InviteById from '../routers/invite/$id/index.js'
import type InviteClaim from '../routers/invite/$code.js'

type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer R) => void ? { [K in keyof R]: R[K] }: never
type UnwrapPromise<T> = T extends Promise<any> ? Awaited<T> : T
type FirstParameter<T> = T extends Router<infer First, any, any, any> ? First : never


export type Routers = {
  '/invite/:code': {
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof InviteClaim.methods.get>>>,
      request: undefined,
      auth: undefined,
      query: undefined
    },
    post: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof InviteClaim.methods.post>>>,
      request: z.infer<NonNullable<typeof InviteClaim.schema>['post']>,
      auth: undefined,
      query: undefined
    }
  },
  '/invite/id/:id=number': {
    delete: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof InviteById.methods.delete>>>,
      request: undefined,
      auth: undefined,
      query: undefined
    },
    get: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof InviteById.methods.get>>>,
      request: undefined,
      auth: undefined,
      query: undefined
    },
    put: {
      response: MergeUnion<UnwrapPromise<ReturnType<typeof InviteById.methods.put>>>,
      request: z.infer<NonNullable<typeof InviteById.schema>['put']>,
      auth: undefined,
      query: undefined
    }
  }
}