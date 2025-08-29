import type { User } from '@/database'
import type { BearerStrategy } from '@/strategies/BearerStrategy'
import type { CookiesStrategy } from '@/strategies/CookiesStrategy'
import type { Runtime } from '@asterflow/adapter'
import type { AnyAsterflow } from '@asterflow/core'
import type { Responders } from '@asterflow/response'
import type {
  AnySchema,
  MethodHandler, MethodKeys,
  Middleware,
  MiddlewareOutput,
  Method as OriginalMethod,
  MethodOptions as OriginalMethodOptions
} from '@asterflow/router'

export type ListResponse = {
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export declare module '@asterflow/response' {
  interface Responders<TData> {
    200: {
      message: string
      data: TData
      metadata: TData extends unknown[] ? ListResponse : unknown
    }
  }
  // interface AsterResponse {}
}

export declare module '@asterflow/request' {
  interface AsterRequest {
    user: User
  }
}

export declare module '@asterflow/core' {
  interface AsterFlowInstance {
    auth: {
      strategies: (typeof BearerStrategy | typeof CookiesStrategy)[]
    }
  }
}

declare module '@asterflow/router' {
  type PatchedMethodOptionsFS<
  Responder extends Responders,
  const Path extends string = string,
  const Drive extends Runtime = Runtime,
  const Method extends MethodKeys = MethodKeys,
  const Schema extends AnySchema = AnySchema,
  const Middlewares extends readonly Middleware<Responder, Schema, string, Record<string, unknown>>[] = [],
  const Context extends MiddlewareOutput<Middlewares> = MiddlewareOutput<Middlewares>,
  const Instance extends AnyAsterflow = AnyAsterflow,
  const Handler extends MethodHandler<Path, Drive, Responder, Schema, Middlewares, Context, Instance> = MethodHandler<Path, Drive, Responder, Schema, Middlewares, Context, Instance>,
  > = Omit<OriginalMethodOptions<Responder, Path, Drive, Method, Schema, Middlewares, Context, Instance, Handler>, 'path'> 
    & {
      path?: Path;
      param?: Path
    };

  export class Method<
  Responder extends Responders,
  const Path extends string = string,
  const Drive extends Runtime = Runtime,
  const Method extends MethodKeys = MethodKeys,
  const Schema extends AnySchema = AnySchema,
  const Middlewares extends readonly Middleware<Responder, Schema, string, Record<string, unknown>>[] = [],
  const Context extends MiddlewareOutput<Middlewares> = MiddlewareOutput<Middlewares>,
  const Instance extends AnyAsterflow = AnyAsterflow,
  const Handler extends MethodHandler<Path, Drive, Responder, Schema, Middlewares, Context, Instance> = MethodHandler<Path, Drive, Responder, Schema, Middlewares, Context, Instance>,
  > extends OriginalMethod<Responder, Path, Drive, Method, Schema, Middlewares, Context, Instance, Handler> {
    constructor(options: PatchedMethodOptionsFS<Responder, Path, Drive, Method, Schema, Middlewares, Context, Instance, Handler>)
  }
}