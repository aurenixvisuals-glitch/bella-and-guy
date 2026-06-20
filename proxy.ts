import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("bg_role")?.value;

  if (pathname.startsWith("/bg-secure-4x9k")) {
    if (!role || role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/staff")) {
    if (!role || (role !== "staff" && role !== "admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bg-secure-4x9k/:path*", "/staff/:path*"],
};
