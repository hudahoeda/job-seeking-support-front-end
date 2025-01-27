import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")
  const isLoginPage = request.nextUrl.pathname === "/login"

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/brief", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/signup", "/brief", "/interview"],
}

