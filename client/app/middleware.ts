import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Pega os cookies da requisição que chega no servidor
  const accessToken = request.cookies.get('Bearer')?.value
  const refreshToken = request.cookies.get('Refresh')?.value

  const { pathname } = request.nextUrl

  // Se o usuário não tem tokens e está tentando acessar uma rota protegida
  if (!accessToken || !refreshToken) {
    // Redireciona para a página de login, mantendo a URL original como um parâmetro
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  // Se o usuário está autenticado, permite que a requisição continue
  return NextResponse.next()
}

// Configuração para definir quais rotas serão protegidas pelo middleware
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto aquelas que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone de favoritos)
     * - auth (páginas de autenticação)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}