"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from "lucide-react"
import { usePWAInstall, useNetworkStatus } from "@/lib/pwa"
import { useNotifications } from "@/lib/store"

/**
 * Componente para prompt de instalação PWA
 * Mostra quando a aplicação pode ser instalada
 */
export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()
  const { addNotification } = useNotifications()
  const [isVisible, setIsVisible] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)

  // Mostra o prompt após um delay se for instalável
  React.useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000) // Aguarda 3 segundos antes de mostrar

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, isDismissed])

  /**
   * Manipula a instalação
   */
  const handleInstall = async () => {
    const success = await promptInstall()

    if (success) {
      addNotification({
        title: "App Instalado!",
        message: "Maker Space Manager foi instalado com sucesso",
        type: "success",
      })
      setIsVisible(false)
    } else {
      addNotification({
        title: "Instalação Cancelada",
        message: "Você pode instalar o app a qualquer momento",
        type: "info",
      })
    }
  }

  /**
   * Dispensa o prompt
   */
  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  // Verifica se foi dispensado anteriormente
  React.useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  if (!isVisible || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Instalar App</CardTitle>
                <CardDescription>Acesso rápido e offline</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Benefícios */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Monitor className="h-3 w-3" />
                <span>Acesso rápido</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <WifiOff className="h-3 w-3" />
                <span>Funciona offline</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="flex-1" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
              <Button variant="outline" onClick={handleDismiss} size="sm">
                Agora não
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Indicador de status de conexão
 */
export function NetworkStatusIndicator() {
  const { isOnline, connectionType } = useNetworkStatus()
  const [showIndicator, setShowIndicator] = React.useState(false)

  // Mostra indicador quando fica offline
  React.useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
    } else {
      // Esconde após 3 segundos quando volta online
      const timer = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showIndicator) {
    return null
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className={`shadow-lg ${isOnline ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}

            <div className="flex-1">
              <p className={`text-sm font-medium ${isOnline ? "text-green-800" : "text-red-800"}`}>
                {isOnline ? "Conectado" : "Sem conexão"}
              </p>
              <p className={`text-xs ${isOnline ? "text-green-600" : "text-red-600"}`}>
                {isOnline ? `Conexão ${connectionType} ativa` : "Alguns recursos podem não estar disponíveis"}
              </p>
            </div>

            {isOnline && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
