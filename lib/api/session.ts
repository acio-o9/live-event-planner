import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";

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

/**
 * 認証済みセッションとDBユーザーIDを取得する。
 * 未認証またはユーザーレコードが存在しない場合は 401 を返す。
 */
export async function requireUser() {
  const { session, error } = await requireSession();
  if (error || !session) return { session: null, userId: null, role: null as UserRole | null, error };

  const user = await prisma.user.findUnique({
    where: { sub: session.user.sub },
    select: { id: true, role: true },
  });
  if (!user) {
    return {
      session: null,
      userId: null,
      role: null as UserRole | null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, userId: user.id, role: user.role as UserRole, error: null };
}
