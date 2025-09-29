import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  console.log("Cookies seen in middleware:", request.cookies.getAll());
  const token = request.cookies.get('firebase-auth-token')?.value
  const { pathname } = request.nextUrl
 
  if (token) {
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
 
  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
