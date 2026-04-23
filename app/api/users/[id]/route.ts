import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeUser, userInclude } from "@/lib/db/serializers";

// 全角換算文字数カウント（全角=1、半角=0.5）
function countWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    width += char.match(/[　-鿿！-｠￠-￦]/) ? 1 : 0.5;
  }
  return width;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nickname } = body as { nickname?: unknown };

  if (typeof nickname !== "string" || nickname.trim() === "") {
    return Response.json({ error: "ニックネームは必須です" }, { status: 400 });
  }
  const trimmed = nickname.trim();
  if (/[\r\n\t]/.test(trimmed)) {
    return Response.json({ error: "ニックネームに使用できない文字が含まれています" }, { status: 400 });
  }
  if (countWidth(trimmed) > 10) {
    return Response.json({ error: "ニックネームは全角10文字以内で入力してください" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt !== null) {
    return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { nickname: trimmed },
    include: userInclude,
  });

  return Response.json(serializeUser(user));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt !== null) {
    return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return Response.json({ ok: true });
}
