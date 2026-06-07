import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  rateLimit,
  getClientIp,
  AUTH_LIMIT,
  AUTH_WINDOW_MS,
  API_LIMIT,
  API_WINDOW_MS,
} from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ======== Rate Limiting ========
  const clientIp = getClientIp(request);

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    let limitResult;

    // Skip rate limiting for CSRF and session GET
    const isCsrfRoute = pathname === "/api/auth/csrf";
    const isSessionGet = pathname === "/api/auth/session" && request.method === "GET";

    if (!isCsrfRoute && !isSessionGet) {
      // Auth endpoints get stricter rate limiting
      if (pathname.startsWith("/api/auth/")) {
        limitResult = rateLimit(
          `auth:${clientIp}`,
          AUTH_LIMIT,
          AUTH_WINDOW_MS
        );
      } else {
        // General API rate limiting
        limitResult = rateLimit(
          `api:${clientIp}`,
          API_LIMIT,
          API_WINDOW_MS
        );
      }

      if (!limitResult.success) {
        const response = NextResponse.json(
          {
            error: "Too many requests. Please try again later.",
            retryAfter: Math.ceil(
              (limitResult.resetAt - Date.now()) / 1000
            ),
          },
          { status: 429 }
        );

        // Set rate limit headers
        response.headers.set("X-RateLimit-Limit", String(limitResult.limit));
        response.headers.set(
          "X-RateLimit-Remaining",
          String(limitResult.remaining)
        );
        response.headers.set(
          "X-RateLimit-Reset",
          String(Math.ceil(limitResult.resetAt / 1000))
        );
        response.headers.set(
          "Retry-After",
          String(Math.ceil((limitResult.resetAt - Date.now()) / 1000))
        );

        return response;
      }
    }
  }

  // ======== Public Routes - no auth needed ========
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/hotels",
    "/pricing",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
    "/reset-password",
    "/payment/callback",
  ];
  const isPublicRoute =
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/hotels/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/hotels") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/payment/");

  if (isPublicRoute) {
    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    return response;
  }

  // Static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // ======== Auth Check ========
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
  if (
    (pathname.startsWith("/hotel") || pathname.startsWith("/api/hotel")) &&
    !isHotelCancelRoute
  ) {
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
    "/api/auth/:path*",
    "/api/payment/:path*",
    "/reset-password/:path*",
    "/payment/callback/:path*",
  ],
};
