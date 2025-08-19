"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Box,
  Warehouse,
  Wrench,
  ClipboardList,
  BarChart3,
  Menu,
  Home,
  Plus,
  Search,
  Bell,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/lib/store"

/**
 * Itens de navegação para mobile
 */
const mobileNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Itens", href: "/dashboard/items", icon: Box },
  { title: "Estoque", href: "/dashboard/stock", icon: Warehouse },
  { title: "Manutenção", href: "/dashboard/maintenance", icon: Wrench },
  { title: "Projetos", href: "/dashboard/projects", icon: ClipboardList },
  { title: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { title: "Logs", href: "/dashboard/settings/logs", icon: FileText },
]

/**
 * Navegação inferior para mobile (Bottom Navigation)
 */
export function MobileBottomNavigation() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  // Itens principais para a barra inferior
  const bottomNavItems = [
    { title: "Início", href: "/dashboard", icon: Home },
    { title: "Itens", href: "/dashboard/items", icon: Box },
    { title: "Adicionar", href: "/dashboard/items/new", icon: Plus, isAction: true },
    { title: "Estoque", href: "/dashboard/stock", icon: Warehouse },
    { title: "Mais", href: "#", icon: Menu, isMenu: true },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around py-2 px-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

          if (item.isMenu) {
            return (
              <Sheet key={item.title}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs">{item.title}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh]">
                  <MobileNavigationMenu />
                </SheetContent>
              </Sheet>
            )
          }

          return (
            <Link key={item.title} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 relative",
                  isActive && "text-primary bg-primary/10",
                  item.isAction && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.title}</span>

                {/* Badge para notificações */}
                {item.title === "Início" && unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/**
 * Menu de navegação completo para mobile
 */
function MobileNavigationMenu() {
  const pathname = usePathname()

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Menu de Navegação</h3>
        <p className="text-sm text-muted-foreground">Acesse todas as funcionalidades</p>
      </div>

      <ScrollArea className="h-[40vh]">
        <div className="grid grid-cols-2 gap-3 p-4">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link key={item.title} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary/10 border-primary text-primary",
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm font-medium text-center">{item.title}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * Header mobile com navegação drawer
 */
export function MobileHeader() {
  const { unreadCount } = useNotifications()

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">MS</span>
        </div>
        <span className="font-semibold">MakerSpace</span>
      </Link>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {/* Busca */}
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}

/**
 * Componente para gestos de navegação
 */
export function MobileNavigationGestures({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const pages = mobileNavItems

  /**
   * Navega para a próxima página
   */
  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % pages.length)
  }, [pages.length])

  /**
   * Navega para a página anterior
   */
  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + pages.length) % pages.length)
  }, [pages.length])

  return (
    <div className="relative h-full">
      {/* Indicadores de página */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
        {pages.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>

      {/* Conteúdo com gestos */}
      <div
        className="h-full"
        onTouchStart={(e) => {
          const touch = e.touches[0]
          // Implementar lógica de swipe aqui
        }}
      >
        {children}
      </div>
    </div>
  )
}
