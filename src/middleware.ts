// @ts-ignore - next-auth/jwt types issue in build
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isApiAdminRoute =
    request.nextUrl.pathname.startsWith("/api/") &&
    (request.method === "POST" ||
      request.method === "PUT" ||
      request.method === "DELETE") &&
    !request.nextUrl.pathname.startsWith("/api/auth") &&
    !request.nextUrl.pathname.startsWith("/api/cron");

  if (isAdminRoute || isApiAdminRoute) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // SECURITY: Check if user has ADMIN role
    if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
