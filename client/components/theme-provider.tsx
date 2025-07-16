"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

/**
 * Provedor de tema simplificado - apenas tema claro
 * Mantém a estrutura para compatibilidade com componentes existentes
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      forcedTheme="light" // Força sempre o tema claro
      enableSystem={false} // Desabilita detecção do sistema
    >
      {children}
    </NextThemesProvider>
  )
}
