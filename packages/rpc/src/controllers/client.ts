import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios, { AxiosError } from 'axios'
import { CodesError, type ErrorData, type SucessData, type TReply } from 'server'
import { ErrorResponse, SuccessResponse, type SuccessResponseOptions } from '../app'
import { ZodResponse } from '../responders/zod'
import { ZodError } from 'zod'

function isErrorStatus(status: number): status is typeof CodesError[number] {
  return CodesError.includes(status as typeof CodesError[number])
}

type ExtractRouteParams<T extends string> = T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractRouteParams<Rest>]: string | number }
  : T extends `${infer Start}:${infer Param}`
    ? { [K in Param]: string | number }
    : Record<string, never>

type HasRouteParams<T extends string> = T extends `${string}:${string}` ? true : false

type RouterShape = {
  response: unknown
  request?: unknown
  auth?: unknown
}

type QueryArgs<
  Path extends string,
  Method extends string,
  Router extends RouterShape
> = [
  ...(HasRouteParams<Path> extends true
    ? [
        params: ExtractRouteParams<Path>,
        ...(Router extends { request: infer Req }
          ? [request: Req]
          : [])
      ]
    : Router extends { request: infer Req }
      ? [request: Req]
      : [])
]

type ExtractSuccessData<T> = T extends { 200: SucessData<infer U> } | { 201: SucessData<infer U> } ? U : never

// Tipagem para a resposta do endpoint de refresh
type RefreshTokenResponse = SucessData<{
  accessToken: {
    token: string
    expireDate: Date
    expireSeconds: number
  }
  refreshToken: {
    token: string
    expireDate: Date
    expireSeconds: number
  }
}>

// Tipagem para a função que está na fila de espera
type FailedQueuePromise = {
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}

export class Client<Routers extends Record<string, Record<string, RouterShape>>> {
  private accessToken?: string
  private refreshToken?: string
  private api: AxiosInstance

  // Controle para evitar múltiplas chamadas de refresh simultâneas
  private isRefreshing = false
  private failedQueue: FailedQueuePromise[] = []

  constructor(private host: string) {
    // Cria uma instância do axios para uso interno da classe
    this.api = axios.create({
      baseURL: this.host,
    })

    // Adiciona o interceptor de requisição
    this.api.interceptors.request.use(config => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })

    // Adiciona o interceptor de resposta para lidar com refresh token
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config
        
        // Verifica se o erro é 401 e se não é uma tentativa de refresh falha
        if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/refresh')) {
          if (!this.isRefreshing) {
            this.isRefreshing = true

            try {
              const { data } = await axios.post<RefreshTokenResponse>(`${this.host}/auth/refresh`, {
                refreshToken: this.refreshToken,
              })

              const newAccessToken = data.data.accessToken.token
              this.setAccessToken(newAccessToken)
              this.setRefreshToken(data.data.refreshToken.token)
              
              // Atualiza o header da requisição original
              this.api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
              if(originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

              // Processa a fila de requisições que falharam
              this.processQueue(null, newAccessToken)

              // Retenta a requisição original
              return this.api(originalRequest)
            } catch (refreshError) {
              this.processQueue(refreshError as AxiosError, null)
              // Em caso de falha no refresh, limpa os tokens e desloga
              this.accessToken = undefined
              this.refreshToken = undefined
              return Promise.reject(refreshError)
            } finally {
              this.isRefreshing = false
            }
          }

          // Adiciona a requisição falha na fila enquanto o token está sendo atualizado
          return new Promise((resolve, reject) => {
            this.failedQueue.push({
              resolve: (token: string) => {
                if(originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.api(originalRequest))
              },
              reject: (err: AxiosError) => {
                reject(err)
              },
            })
          })
        }

        return Promise.reject(error)
      }
    )
  }

  private processQueue(error: AxiosError | null, token: string | null = null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error)
      } else if (token) {
        promise.resolve(token)
      }
    })
    this.failedQueue = []
  }

  setAccessToken(token: string) {
    this.accessToken = token
    this.api.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  setRefreshToken(token: string) {
    this.refreshToken = token
  }

  private replacePathParams(path: string, params?: Record<string, string | number>): string {
    if (!params) return path
    return path.replace(/:([^/]+)/g, (_, param) => String(params[param] ?? ''))
  }

  async query<
    Path extends keyof Routers & string,
    Method extends keyof Routers[Path] & string,
    Router extends Routers[Path][Method] & RouterShape
  >(
    path: Path,
    method: Method,
    ...args: QueryArgs<Path, Method, Router>
  ): Promise<ErrorResponse | ZodResponse | SuccessResponse<ExtractSuccessData<Router['response']>>> {
    const hasParams = String(path).includes(':')
    const params = hasParams ? args[0] as Record<string, string | number> : undefined
    const request = hasParams ? args[1] : args[0]

    const config: AxiosRequestConfig = {
      url: this.replacePathParams(String(path), params),
      method: String(method).toUpperCase(),
      // O header de autorização agora é injetado pelo interceptor
      params: method === 'get' ? Object.assign({}, request) : undefined,
      data: method !== 'get' ? Object.assign({}, request) : undefined
    }

    try {
      // Usa a instância 'this.api' com os interceptors configurados
      const response: AxiosResponse<Router['response']> = await this.api(config)

      if (isErrorStatus(response.status)) {
        const errorData = response.data as ErrorData
        return new ErrorResponse({
          message: errorData.message,
          error: errorData.error,
        }).setKey(response.status)
      }

      // Se for uma resposta de login, configura os tokens
      if (path === '/auth/login' && method === 'post') {
        const data = response.data as RefreshTokenResponse
        if (data.data?.accessToken?.token && data.data?.refreshToken?.token) {
          this.setAccessToken(data.data.accessToken.token)
          this.setRefreshToken(data.data.refreshToken.token)
        }
      }

      const successData = response.data as SucessData<ExtractSuccessData<Router['response']>>
      return new SuccessResponse({
        message: successData.message,
        data: successData.data,
        metadata: 'metadata' in successData ? successData.metadata : undefined
      } as SuccessResponseOptions<ExtractSuccessData<Router['response']>>).setKey(response.status as keyof TReply<unknown>)
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.message) {
        if (err.response?.data?.error?.name === 'ZodError') {
          return new ZodResponse({ 
            message: err.response.data.message,
            error: err.response.data.error as ZodError 
          }).setKey(err.status as keyof TReply<unknown>)
        }
        return new ErrorResponse({ message: err.response?.data?.message ?? err.message }).setKey(err.status as keyof TReply<unknown>)
      }
      throw err
    }
  }
}