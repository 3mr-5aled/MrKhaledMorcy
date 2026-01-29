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
    !request.nextUrl.pathname.startsWith("/api/auth");

  if (isAdminRoute || isApiAdminRoute) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
