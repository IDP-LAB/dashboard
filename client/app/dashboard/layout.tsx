"use client"

import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import BaseLoading from "@/components/loading/BaseLoading"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { SessionProvider } from "@/providers/session"
import { useQuery } from "@tanstack/react-query"
import Cookies from "js-cookie"
import { redirect } from "next/navigation"

export default function DashLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { client } = useAPI()
  const accessToken = Cookies.get('Bearer')
  const refreshToken = Cookies.get('Refresh')
  
  if (accessToken) client.setAccessToken(accessToken)
  if (refreshToken) client.setRefreshToken(refreshToken)

  const { isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await client.query('/users/profile', 'get')

      if (!isSuccessResponse(response)) throw new Error("Falha ao validar perfil.")
      
      return response.data
    },
    retry: false
  })

  if (isError) redirect('/auth/login')
  if (isLoading) return <BaseLoading />


  return (
    <SessionProvider>
      <SidebarProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </SidebarProvider>
    </SessionProvider>
  )
}