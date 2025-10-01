import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 🔐 Example: Authentication check
  // if (!request.cookies.get("auth-token")) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // 🚫 Example: Block access to a specific path
  // if (request.nextUrl.pathname.startsWith("/admin")) {
  //   return NextResponse.redirect(new URL("/unauthorized", request.url));
  // }

  // ✅ Default: allow request to continue
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes EXCEPT api, _next assets, and favicon
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
