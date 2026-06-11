import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateAdminCredentials } from "./src/lib/admin-auth"

export function middleware(request: NextRequest) {
  if (validateAdminCredentials(request.headers.get("authorization"))) {
    return NextResponse.next()
  }

  return new NextResponse("Admin authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Affiliate Admin"',
    },
  })
}

export const config = {
  matcher: ["/admin/:path*"],
}
