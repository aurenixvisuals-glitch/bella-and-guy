import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("bg_role")?.value;

  // Protect /admin — requires admin role
  if (pathname.startsWith("/admin")) {
    if (!role || role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect /staff — requires staff or admin role
  if (pathname.startsWith("/staff")) {
    if (!role || (role !== "staff" && role !== "admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*"],
};
