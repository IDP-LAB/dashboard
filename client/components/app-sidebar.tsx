"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAPI } from "@/hooks/useAPI"
import { usePreferences } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Box,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  UserPlus,
  InfoIcon
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"

/**
 * Itens de navegação principal da sidebar
 * Cada item contém título, rota e ícone correspondente
 */
const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projetos", href: "/dashboard/projects", icon: ClipboardList },
  { title: "Itens", href: "/dashboard/items", icon: Box },
  { title: "Usuários", href: "/dashboard/users", icon: Users },
  { title: "Convites", href: "/dashboard/invites", icon: UserPlus },
  { title: "Colaboradores", href: "/dashboard/about", icon: InfoIcon },
  // { title: "Estoque", href: "/dashboard/stock", icon: Warehouse },
  //{ title: "Manutenção", href: "/dashboard/maintenance", icon: Wrench },
  //{ title: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
]

/**
 * Itens de navegação das configurações
 * Organizados em uma seção separada e colapsível
 */
const settingsNavItems: { title: string, href: string, icon: React.ElementType }[] = [
  { title: "Logs", href: "/dashboard/settings/logs", icon: FileText },
  //{ title: "Usuários", href: "/dashboard/settings/users", icon: Users },
  //{ title: "Categorias", href: "/dashboard/settings/categories", icon: Tags },
  //{ title: "Geral", href: "/dashboard/settings/general", icon: Settings },
]

/**
 * Componente da sidebar principal da aplicação
 * Contém navegação, configurações e informações do usuário
 * Agora com funcionalidade de expansão/retração completa
 */
export function AppSidebar() {
  const { logout } = useAPI()
  const router = useRouter()
  // Hook para obter a rota atual
  const pathname = usePathname()
  // Hook para controlar o estado da sidebar (expandida/colapsada)
  const { state, toggleSidebar } = useSidebar()
  // Hook para preferências do usuário
  const { preferences, updatePreferences } = usePreferences()
  // Estado para controlar se a seção de configurações está aberta
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(pathname.startsWith("/dashboard/settings"))

  // Sincroniza o estado da sidebar com as preferências
  React.useEffect(() => {
    updatePreferences({ sidebarCollapsed: state === "collapsed" })
  }, [state, updatePreferences])

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Mesmo se houver erro, redireciona para o login
      router.push("/auth/login")
    }
  }

  return (
    <Sidebar collapsible="icon" side="left" className="border-r transition-all duration-300 ease-in-out">
      {/* === CABEÇALHO DA SIDEBAR === */}
      <SidebarHeader className="p-2 border-b bg-white">
        <Link href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
          {/* Logo do projeto substituindo o ícone e texto antigo */}
          <img src="/idealab_azul.png" alt="IDEA LAB idp logo" className="h-8 w-auto" />
        </Link>
      </SidebarHeader>

      {/* === CONTEÚDO PRINCIPAL DA SIDEBAR === */}
      <SidebarContent className="flex-1 p-0 bg-white">
        {/* Seção de navegação principal */}
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className={cn(state === "collapsed" && "hidden")}>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    // Determina se o item está ativo baseado na rota atual
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                    // Tooltip que aparece quando a sidebar está colapsada
                    tooltip={{ children: item.title, side: "right", align: "center" }}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separador visual entre seções */}
        <SidebarSeparator className="my-2" />

        {/* Seção de configurações (colapsível) */}
        {settingsNavItems.length > 0 && (
        <SidebarGroup className="p-2">
          <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            {/* Botão para expandir/colapsar configurações */}
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-muted transition-colors",
                  state === "collapsed" && "justify-center",
                )}
              >
                {/* Conteúdo do botão muda baseado no estado da sidebar */}
                {state === "expanded" && (
                  <span className="text-xs font-medium text-muted-foreground">Configurações</span>
                )}
                {state === "collapsed" && <Settings className="h-4 w-4" />}
                {state === "expanded" &&
                  (isSettingsOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ))}
              </button>
            </CollapsibleTrigger>

            {/* Conteúdo colapsível das configurações */}
            <CollapsibleContent className="transition-all duration-200">
              <SidebarGroupContent className={cn(state === "collapsed" && "hidden", "mt-1")}>
                <SidebarMenu>
                  {settingsNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        size="sm" // Tamanho menor para subitens
                        isActive={pathname === item.href}
                        tooltip={{ children: item.title, side: "right", align: "center" }}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        )}
      </SidebarContent>

      {/* === RODAPÉ DA SIDEBAR (INFORMAÇÕES DO USUÁRIO) === */}
      <SidebarFooter className="p-2 border-t bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start p-2 transition-all duration-200 hover:bg-accent",
                state === "collapsed" && "justify-center size-10 p-0",
              )}
            >
              {/* Avatar do usuário */}
              <Avatar className={cn("h-8 w-8", state === "collapsed" && "h-6 w-6")}>
                <AvatarImage src="/placeholder-user.jpg" alt="Usuário" />
                <AvatarFallback className="bg-primary text-primary-foreground">US</AvatarFallback>
              </Avatar>
              {/* Nome e ícone aparecem apenas quando expandida */}
              {state === "expanded" && <span className="ml-2 font-medium">Usuário</span>}
              {state === "expanded" && <ChevronUp className="ml-auto h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>

          {/* Menu dropdown do usuário */}
          <DropdownMenuContent side="top" align="start" className="w-[--radix-popper-anchor-width]">
            {/*
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-accent">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            */}
            <DropdownMenuItem 
              className="text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      {/* Rail para redimensionar a sidebar */}
      <SidebarRail />
    </Sidebar>
  )
}
