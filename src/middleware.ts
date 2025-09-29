import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('firebase-auth-token')?.value

  const { pathname } = request.nextUrl
 
  if (pathname.startsWith('/login')) {
    if (currentUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
 
  if (!currentUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
