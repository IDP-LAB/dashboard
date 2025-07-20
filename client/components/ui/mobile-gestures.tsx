"use client"

import * as React from "react"
import { useSwipeable } from "react-swipeable"
import { cn } from "@/lib/utils"

/**
 * Interface para configuração de gestos
 */
interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
  trackMouse?: boolean
}

/**
 * Hook para gestos de swipe
 */
export function useSwipeGestures(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = config

  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    onSwipedUp: onSwipeUp,
    onSwipedDown: onSwipeDown,
    preventDefaultTouchmoveEvent,
    trackMouse,
    delta: threshold,
  })

  return handlers
}

/**
 * Componente para pull-to-refresh
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
  threshold?: number
  disabled?: boolean
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const startY = React.useRef(0)
  const currentY = React.useRef(0)

  /**
   * Inicia o gesto de pull
   */
  const handleTouchStart = React.useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return

      const container = containerRef.current
      if (!container || container.scrollTop > 0) return

      startY.current = e.touches[0].clientY
      setIsPulling(true)
    },
    [disabled, isRefreshing],
  )

  /**
   * Acompanha o movimento do pull
   */
  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return

      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)

      // Aplica resistência ao movimento
      const resistance = Math.min(distance / 2, threshold * 1.5)
      setPullDistance(resistance)

      // Previne scroll se estiver puxando
      if (distance > 10) {
        e.preventDefault()
      }
    },
    [isPulling, disabled, isRefreshing, threshold],
  )

  /**
   * Finaliza o gesto de pull
   */
  const handleTouchEnd = React.useCallback(async () => {
    if (!isPulling || disabled) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error("Erro no refresh:", error)
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh])

  // Event listeners
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const shouldTrigger = pullDistance >= threshold

  return (
    <div ref={containerRef} className={cn("relative overflow-auto", className)}>
      {/* Indicador de pull-to-refresh */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          "bg-background/90 backdrop-blur-sm border-b",
          isPulling || isRefreshing ? "opacity-100" : "opacity-0",
        )}
        style={{
          height: Math.max(pullDistance, isRefreshing ? 60 : 0),
          transform: `translateY(${isPulling ? 0 : -60}px)`,
        }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Atualizando...</span>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "w-4 h-4 border-2 border-muted-foreground rounded-full transition-transform duration-200",
                  shouldTrigger && "border-primary",
                )}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              >
                <div className="w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-b-2 border-b-current" />
              </div>
              <span className={shouldTrigger ? "text-primary" : ""}>
                {shouldTrigger ? "Solte para atualizar" : "Puxe para atualizar"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Componente para ações de swipe em itens de lista
 */
interface SwipeActionProps {
  children: React.ReactNode
  leftActions?: Array<{
    icon: React.ReactNode
    label: string
    color: string
    action: () => void
  }>
  rightActions?: Array<{
    icon: React.ReactNode
    label: string
    color: string
    action: () => void
  }>
  className?: string
}

export function SwipeAction({ children, leftActions = [], rightActions = [], className }: SwipeActionProps) {
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const maxSwipeDistance = 120 // Distância máxima do swipe

  /**
   * Handlers para swipe
   */
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: () => {
      if (rightActions.length > 0) {
        setIsAnimating(true)
        setSwipeOffset(-maxSwipeDistance)
        setTimeout(() => setIsAnimating(false), 300)
      }
    },
    onSwipeRight: () => {
      if (leftActions.length > 0) {
        setIsAnimating(true)
        setSwipeOffset(maxSwipeDistance)
        setTimeout(() => setIsAnimating(false), 300)
      }
    },
    threshold: 30,
    preventDefaultTouchmoveEvent: true,
  })

  /**
   * Reseta o swipe
   */
  const resetSwipe = React.useCallback(() => {
    setIsAnimating(true)
    setSwipeOffset(0)
    setTimeout(() => setIsAnimating(false), 300)
  }, [])

  /**
   * Executa ação e reseta
   */
  const executeAction = React.useCallback(
    (action: () => void) => {
      action()
      resetSwipe()
    },
    [resetSwipe],
  )

  // Clique fora para resetar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        resetSwipe()
      }
    }

    if (swipeOffset !== 0) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [swipeOffset, resetSwipe])

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)} {...swipeHandlers}>
      {/* Ações da esquerda */}
      {leftActions.length > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{
            width: maxSwipeDistance,
            transform: `translateX(${Math.min(swipeOffset - maxSwipeDistance, 0)}px)`,
          }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              className={cn(
                "flex-1 h-full flex flex-col items-center justify-center text-white text-xs font-medium",
                action.color,
              )}
              onClick={() => executeAction(action.action)}
            >
              {action.icon}
              <span className="mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Ações da direita */}
      {rightActions.length > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center"
          style={{
            width: maxSwipeDistance,
            transform: `translateX(${Math.max(swipeOffset + maxSwipeDistance, 0)}px)`,
          }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              className={cn(
                "flex-1 h-full flex flex-col items-center justify-center text-white text-xs font-medium",
                action.color,
              )}
              onClick={() => executeAction(action.action)}
            >
              {action.icon}
              <span className="mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo principal */}
      <div
        className="relative bg-background"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isAnimating ? "transform 0.3s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Hook para detectar gestos de toque
 */
export function useTouchGestures() {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null)

  const onTouchStart = React.useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }, [])

  const onTouchMove = React.useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }, [])

  const onTouchEnd = React.useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > 50
    const isRightSwipe = distanceX < -50
    const isUpSwipe = distanceY > 50
    const isDownSwipe = distanceY < -50

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY,
    }
  }, [touchStart, touchEnd])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
