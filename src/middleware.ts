import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeEdgeJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessTokenCookie =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  let user: any = null;

  if (accessTokenCookie) {
    const payload = decodeEdgeJwt(accessTokenCookie);
    if (payload && (!payload.exp || Date.now() < payload.exp * 1000)) {
      user = payload;
    }
  }

  const isAuthenticated = !!user;
  const userRole = user?.role || "CUSTOMER";

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/register-owner");

  const isAdminDashboardRoute = pathname.startsWith("/admin/dashboard");
  const isOwnerDashboardRoute = pathname.startsWith("/owner/dashboard");
  const isMechanicDashboardRoute = pathname.startsWith("/mechanic/dashboard");
  const isCustomerDashboardRoute =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/admin/dashboard") &&
    !pathname.startsWith("/owner/dashboard") &&
    !pathname.startsWith("/mechanic/dashboard");
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  // 1. Authenticated user visiting login/register -> redirect to appropriate dashboard
  if (isAuthRoute && isAuthenticated) {
    let destination = "/dashboard";
    if (userRole === "ADMIN") {
      destination = "/admin/dashboard";
    } else if (userRole === "OWNER") {
      destination = "/owner/dashboard";
    } else if (userRole === "MECHANIC") {
      destination = "/mechanic/dashboard";
    }
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 2. Unauthenticated user accessing protected dashboard or onboarding routes
  if ((isCustomerDashboardRoute || isAdminDashboardRoute || isOwnerDashboardRoute || isMechanicDashboardRoute || isOnboardingRoute) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Admin dashboard route protection (Only ADMIN)
  if (isAdminDashboardRoute && isAuthenticated && userRole !== "ADMIN") {
    const destination = userRole === "OWNER" ? "/owner/dashboard" : (userRole === "MECHANIC" ? "/mechanic/dashboard" : "/dashboard");
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 4. Customer or Mechanic trying to access Owner Dashboard -> redirect to appropriate dashboard
  if (isOwnerDashboardRoute && isAuthenticated && userRole !== "OWNER" && userRole !== "ADMIN") {
    const destination = userRole === "MECHANIC" ? "/mechanic/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 5. Non-mechanic trying to access Mechanic Dashboard -> redirect to appropriate dashboard
  if (isMechanicDashboardRoute && isAuthenticated && userRole !== "MECHANIC" && userRole !== "ADMIN") {
    const destination = userRole === "OWNER" ? "/owner/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 6. Owner, Admin, or Mechanic accessing root customer dashboard -> redirect to their role dashboard
  if (pathname === "/dashboard" && isAuthenticated) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (userRole === "OWNER") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url));
    }
    if (userRole === "MECHANIC") {
      return NextResponse.redirect(new URL("/mechanic/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/dashboard/:path*",
    "/owner/dashboard/:path*",
    "/mechanic/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/register-owner",
  ],
};
