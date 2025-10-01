import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔐 Example: Authentication check
  // const token = request.cookies.get("auth-token");
  // if (!token) {
  //   const loginUrl = request.nextUrl.clone();
  //   loginUrl.pathname = "/login";
  //   return NextResponse.redirect(loginUrl);
  // }

  // 🚫 Example: Block access to /admin
  // if (pathname.startsWith("/admin")) {
  //   const unauthorizedUrl = request.nextUrl.clone();
  //   unauthorizedUrl.pathname = "/unauthorized";
  //   return NextResponse.redirect(unauthorizedUrl);
  // }

  // ✅ Default: allow request to continue
  return NextResponse.next();
}

export const config = {
  /**
   * Apply middleware to all routes EXCEPT:
   * - /api (API routes)
   * - /_next/static (Next.js static files)
   * - /_next/image (Next.js image optimization)
   * - /favicon.ico
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
