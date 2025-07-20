"use client"

import { MoonIcon, SunIcon, LaptopIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * Componente para alternar entre temas claro, escuro e sistema
 * Utiliza next-themes para gerenciamento de estado do tema
 */
export function ThemeToggle() {
  // Hooks do next-themes para controle de tema
  const { setTheme, theme, resolvedTheme } = useTheme()
  // Estado para controlar se o componente foi montado (evita problemas de hidratação)
  const [mounted, setMounted] = useState(false)

  // Aguarda a hidratação para evitar problemas de SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Log de debug para monitorar mudanças de tema (pode ser removido em produção)
  useEffect(() => {
    console.log("Debug do Tema:", { theme, resolvedTheme, mounted })
  }, [theme, resolvedTheme, mounted])

  // Não renderiza até estar montado (evita problemas de hidratação)
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Carregando tema...</span>
      </Button>
    )
  }

  /**
   * Função para alterar o tema
   * @param newTheme - Novo tema a ser aplicado ('light', 'dark', 'system')
   */
  const handleThemeChange = (newTheme: string) => {
    console.log("Alterando tema para:", newTheme)
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {/* Ícone do sol (visível no tema claro) */}
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Ícone da lua (visível no tema escuro) */}
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>

      {/* Menu dropdown com opções de tema */}
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <SunIcon className="mr-2 h-4 w-4" />
          <span>Claro</span>
          {/* Indicador visual do tema ativo */}
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <MoonIcon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <LaptopIcon className="mr-2 h-4 w-4" />
          <span>Sistema</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
