import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth-token')?.value
  const { pathname } = request.nextUrl
 
  // If the user is authenticated
  if (token) {
    // If they are trying to access the login page, redirect them to the dashboard
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Otherwise, allow the request
    return NextResponse.next()
  }
 
  // If the user is not authenticated and not on the login page,
  // redirect them to the login page.
  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
 
  // Allow the request to proceed if they are on the login page
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
