import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Example: Add custom logic here
  // Redirect if user not authenticated, block paths, etc.
  
  // For now, just continue
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes EXCEPT api, _next assets, and favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
