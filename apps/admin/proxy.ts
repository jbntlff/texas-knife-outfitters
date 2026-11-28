import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { updateSession } from "@tkb/auth/server"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const publicRoutes = [
    "/",
    "/login",
    "/forgot-password",
    "/unauthorized",
  ]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const { user, response } =
    await updateSession(request)

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\..*).*)",
  ]
};
