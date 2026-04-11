import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<any>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // 1. If not logged in and trying to access protected routes, redirect to login
  if (!session) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Role-based protection for dashboards
  const role = session.user.role;

  // Protect Admin Dashboard
  if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/super-admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect Vendor Dashboard
  if (pathname.startsWith("/dashboard/vendor")) {
    if (role !== "VENDOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect Delivery Dashboard
  if (pathname.startsWith("/dashboard/delivery")) {
    if (role !== "DELIVERY_PARTNER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
