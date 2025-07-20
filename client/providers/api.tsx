"use client"

import { useSession } from "@/stores/auth"
import { createContext, useEffect, useState, type ReactNode } from "react"
import { Client } from "rpc"
import { Routers } from "server"

type APIContextType = {
  client: Client<Routers>
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const APIContext = createContext<APIContextType | null>(null)

type APIProviderProps = {
  children: ReactNode
}

export function APIProvider({ children }: APIProviderProps) {
  const [clientInstance] = useState<Client<Routers>>(
    new Client<Routers>(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3500')
  )

  const accessToken = useSession((state) => state.accessToken)
  const isAuthenticated = useSession((state) => !!state.user)
  const zustandLogin = useSession((state) => state.login)
  const zustandLogout = useSession((state) => state.logout)

  useEffect(() => {
    if (accessToken) {
      // Cria uma NOVA instância do cliente quando um token está disponível.
      // Isso garante que cada sessão de usuário (ou cada novo token)
      // use uma instância limpa do cliente.
      console.log("APIProvider: Access token available, creating new RPC client.");
      clientInstance.setAccessToken(accessToken)
    }
  }, [accessToken, clientInstance])

  return (
    <APIContext.Provider
      value={{
        client: clientInstance,
        isAuthenticated,
        login: zustandLogin,
        logout: zustandLogout,
      }}
    >
      {children}
    </APIContext.Provider>
  )
}