import { useState, useEffect } from 'react'

/**
 * Hook para detectar se a visualização atual corresponde a um dispositivo móvel
 * com base em um ponto de quebra de largura.
 * @param breakpoint A largura máxima (em pixels) para ser considerada móvel. Padrão 640px (Tailwind 'sm').
 * @returns `true` se a largura da janela for menor que o breakpoint, `false` caso contrário.
 */
export default function useMobile (breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < breakpoint)
    checkScreenSize()

    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [breakpoint])

  return isMobile
}