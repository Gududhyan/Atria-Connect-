import { NextResponse } from 'next/server'
import { COOKIE_NAME, verifyToken, ROLE_HOME } from '@/lib/auth'

const ROLE_SEGMENTS = Object.values(ROLE_HOME)

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const payload = await verifyToken(request.cookies.get(COOKIE_NAME)?.value)

  const redirectTo = (path) => NextResponse.redirect(new URL(path, request.url))

  if (!payload) {
    return pathname === '/login' ? NextResponse.next() : redirectTo('/login')
  }

  const home = ROLE_HOME[payload.role] || '/login'

  // Signed-in users never see the login page or a bare root.
  if (pathname === '/login' || pathname === '/') return redirectTo(home)

  // Keep each role inside its own section.
  const segment = `/${pathname.split('/')[1]}`
  if (ROLE_SEGMENTS.includes(segment) && segment !== home) return redirectTo(home)

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.[\\w]+$).*)']
}
