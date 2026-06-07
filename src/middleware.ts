import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth needed
  const publicRoutes = ["/", "/login", "/register", "/hotels", "/pricing", "/about", "/contact", "/faq", "/terms", "/privacy"];
  const isPublicRoute =
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/hotels/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/hotels") ||
    pathname.startsWith("/api/cron/");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Static files and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Admin-only routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Hotel staff routes (except cancel which is accessible by all authenticated users)
  const isHotelCancelRoute = pathname === "/api/hotel/cancel";
  if ((pathname.startsWith("/hotel") || pathname.startsWith("/api/hotel")) && !isHotelCancelRoute) {
    if (role !== "HOTEL_STAFF" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Dashboard/coupons/subscription/bookings routes - require GUEST or ADMIN
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/coupons") ||
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/api/subscription") ||
    pathname.startsWith("/api/coupons")
  ) {
    if (role !== "GUEST" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/coupons/:path*",
    "/subscription/:path*",
    "/bookings/:path*",
    "/hotel/:path*",
    "/admin/:path*",
    "/api/subscription/:path*",
    "/api/coupons/:path*",
    "/api/hotel/:path*",
    "/api/admin/:path*",
  ],
};

