import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PAGES = ["/account"];
const PROTECTED_API_PREFIXES = [
  "/api/profile",
  "/api/saved-products",
  "/api/quiz-results",
  "/api/delete-account",
];

function isProtectedPage(pathname: string) {
  return PROTECTED_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isProtectedApi(pathname: string) {
  return PROTECTED_API_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const pathname = request.nextUrl.pathname;

  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-role, x-user-id",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (isProtectedPage(pathname) || isProtectedApi(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    if (!token) {
      if (isProtectedApi(pathname)) {
        const unauthorized = NextResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Authentication required." },
          },
          { status: 401 }
        );
        unauthorized.headers.set("Access-Control-Allow-Origin", origin || "*");
        return unauthorized;
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-user-role, x-user-id"
    );
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
