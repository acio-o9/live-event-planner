import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  // 認証 API ルートとヘルスチェックはパスする
  if (isAuthRoute) return NextResponse.next();
  if (req.nextUrl.pathname === "/api/health") return NextResponse.next();

  // API ルートへの未認証アクセスは 401
  if (isApiRoute && !isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/:path*"],
};
