import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationCenter } from "@/components/ui/notification-center"

/**
 * Layout principal do dashboard
 * Organiza a sidebar, header e área de conteúdo principal
 * Agora com sistema de notificações integrado
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* Container principal com largura total e altura mínima da tela */
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar da aplicação */}
      <AppSidebar />

      {/* Área principal do conteúdo */}
      <main className="flex-1 flex flex-col">
        {/* Header fixo no topo com gradiente sutil */}
        <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          {/* Lado esquerdo do header - trigger da sidebar e título */}
          <div className="flex items-center gap-1">
            {/* Botão para abrir/fechar sidebar (visível apenas em mobile) */}
            <SidebarTrigger className="md:hidden hover:bg-accent transition-colors" />
            {/* Título da aplicação (oculto em telas pequenas) */}
            <h1 className="text-xl font-semibold ml-2 hidden sm:block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Maker Space Manager
            </h1>
          </div>

          {/* Lado direito do header - notificações */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </header>

        {/* Área de conteúdo com scroll */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          {/* Container para garantir largura total do conteúdo */}
          <div className="w-full animate-in">{children}</div>
        </ScrollArea>
      </main>
    </div>
  )
}
