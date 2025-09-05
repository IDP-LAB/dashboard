import { AppSidebar } from "@/components/app-sidebar"
import { NotificationCenter } from "@/components/ui/notification-center"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger } from "@/components/ui/sidebar"

/**
 * Layout principal do dashboard
 * Organiza a sidebar, header e área de conteúdo principal
 * Agora com sistema de notificações integrado
 */
export function DashboardLayout({
  children
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
            {/* Botão para abrir/fechar sidebar */}
            <SidebarTrigger className="hover:bg-accent transition-colors h-4 w-4" />
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
