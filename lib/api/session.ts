import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * 認証済みセッションを取得する。
 * 未認証の場合は 401 レスポンスを返す。
 */
export async function requireSession() {
  const session = await auth();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
