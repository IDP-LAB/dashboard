"use client"

import * as React from "react"
import { Bell, X, Check, CheckCheck, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/lib/store"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Componente do centro de notificações
 * Exibe notificações em tempo real com ações de marcar como lida e remover
 */
export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } =
    useNotifications()

  const [isOpen, setIsOpen] = React.useState(false)

  /**
   * Obtém o ícone baseado no tipo da notificação
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      default:
        return "ℹ️"
    }
  }

  /**
   * Obtém a cor baseada no tipo da notificação
   */
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  /**
   * Formata o tempo relativo da notificação
   */
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações {unreadCount > 0 && `(${unreadCount} não lidas)`}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* === CABEÇALHO === */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Configurações de notificação</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {unreadCount > 0 && (
                <DropdownMenuItem onClick={markAllAsRead}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Marcar todas como lidas
                </DropdownMenuItem>
              )}
              {notifications.length > 0 && (
                <DropdownMenuItem onClick={clearAllNotifications} className="text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar todas
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* === LISTA DE NOTIFICAÇÕES === */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            // Estado vazio
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            // Lista de notificações
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone da notificação */}
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    </div>

                    {/* Conteúdo da notificação */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4
                            className={`text-sm font-medium ${
                              !notification.read ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatTime(notification.timestamp)}</p>
                        </div>

                        {/* Indicador de não lida */}
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>

                      {/* Ações da notificação */}
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar como lida
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remover
                        </Button>

                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              // Navegar para a URL da ação
                              window.location.href = notification.actionUrl!
                              markAsRead(notification.id)
                              setIsOpen(false)
                            }}
                          >
                            Ver detalhes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* === RODAPÉ === */}
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // Navegar para página de notificações completa
                setIsOpen(false)
              }}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
