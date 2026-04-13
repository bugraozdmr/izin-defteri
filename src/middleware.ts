import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const parsed = await decrypt(session);
    if (!parsed) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (request.nextUrl.pathname === "/login") {
    const session = request.cookies.get("admin_session")?.value;
    if (session) {
      const parsed = await decrypt(session);
      if (parsed) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};