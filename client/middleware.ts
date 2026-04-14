import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and public files
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Call the server's auth/me endpoint to get the session
  let session = null;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    session = res.ok ? await res.json() : null;
  } catch (error) {
    console.error("Middleware Auth Error:", error);
  }

  // 1. If not logged in and trying to access protected routes, redirect to login
  if (!session) {
    // Protected routes: dashboards, profile, checkout, and product details
    const isDashboard = pathname.startsWith("/dashboard");
    const isProfile = pathname.startsWith("/profile");
    const isCheckout = pathname.startsWith("/checkout");
    const isProductDetail = pathname.startsWith("/shop/") && pathname !== "/shop";

    if (isDashboard || isProfile || isCheckout || isProductDetail) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Role-based protection for dashboards
  const role = session.role;

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
  matcher: ["/dashboard/:path*", "/profile/:path*", "/checkout/:path*", "/shop/:path*"],
};
