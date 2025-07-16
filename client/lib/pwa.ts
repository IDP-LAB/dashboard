"use client"

/**
 * Utilitários para funcionalidades PWA
 * Gerencia service workers, cache e instalação
 */

/**
 * Interface para eventos de instalação PWA
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

/**
 * Hook para gerenciar instalação PWA
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Verifica se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkIfInstalled()

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  /**
   * Função para mostrar o prompt de instalação
   */
  const promptInstall = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao mostrar prompt de instalação:", error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  }
}

/**
 * Hook para gerenciar status de conexão
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true)
  const [connectionType, setConnectionType] = React.useState<string>("unknown")

  React.useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updateConnectionType = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || "unknown")
      }
    }

    updateOnlineStatus()
    updateConnectionType()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener("change", updateConnectionType)
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      if (connection) {
        connection.removeEventListener("change", updateConnectionType)
      }
    }
  }, [])

  return { isOnline, connectionType }
}

/**
 * Função para registrar service worker
 */
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      console.log("Service Worker registrado com sucesso:", registration)

      // Verifica por atualizações
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log("Nova versão disponível")
              // Aqui você pode mostrar uma notificação para o usuário
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error("Erro ao registrar Service Worker:", error)
      return null
    }
  }
  return null
}

/**
 * Função para limpar cache antigo
 */
export async function clearOldCaches() {
  if ("caches" in window) {
    const cacheNames = await caches.keys()
    const currentCaches = ["maker-space-v1", "maker-space-images-v1", "maker-space-api-v1"]

    await Promise.all(
      cacheNames.map(async (cacheName) => {
        if (!currentCaches.includes(cacheName)) {
          console.log("Removendo cache antigo:", cacheName)
          return caches.delete(cacheName)
        }
      }),
    )
  }
}

import React from "react"
