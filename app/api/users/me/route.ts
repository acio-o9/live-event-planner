import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeUser, userInclude } from "@/lib/db/serializers";
import { lookupSlackSubByEmail } from "@/lib/auth/slack-allowlist";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  // 初回ログイン時: Slack APIでemailからslackSubを特定し、シード済みユーザーをclaim
  const email = session.user.email ?? null;
  if (email) {
    const slackSub = await lookupSlackSubByEmail(email);
    if (slackSub) {
      const pending = await prisma.user.findFirst({
        where: { slackSub, NOT: { sub: session.user.sub } },
      });
      if (pending) {
        await prisma.user.update({
          where: { sub: pending.sub },
          data: { sub: session.user.sub },
        });
      }
    }
  }

  const user = await prisma.user.upsert({
    where: { sub: session.user.sub },
    update: {
      nickname: session.user.nickname,
      avatarUrl: session.user.avatarUrl ?? null,
    },
    create: {
      sub: session.user.sub,
      nickname: session.user.nickname,
      avatarUrl: session.user.avatarUrl ?? null,
    },
    include: userInclude,
  });

  return Response.json(serializeUser(user));
}

// 全角換算文字数カウント（全角=1、半角=0.5）
function countWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    width += char.match(/[\u3000-\u9fff\uff01-\uff60\uffe0-\uffe6]/) ? 1 : 0.5;
  }
  return width;
}

export async function PUT(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nickname, instrumentIds } = body as {
    nickname?: unknown;
    instrumentIds?: unknown;
  };

  // nickname validation
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

  // instrumentIds validation
  if (!Array.isArray(instrumentIds) || !instrumentIds.every((id) => typeof id === "string")) {
    return Response.json({ error: "instrumentIds は文字列の配列で指定してください" }, { status: 400 });
  }

  if (instrumentIds.length > 0) {
    const count = await prisma.instrument.count({ where: { id: { in: instrumentIds } } });
    if (count !== instrumentIds.length) {
      return Response.json({ error: "存在しない楽器IDが含まれています" }, { status: 400 });
    }
  }

  const sub = session.user.sub;

  const user = await prisma.$transaction(async (tx) => {
    const currentUser = await tx.user.findUnique({ where: { sub }, select: { id: true } });
    if (!currentUser) throw new Error("User not found");

    await tx.userInstrument.deleteMany({ where: { userId: currentUser.id } });
    if (instrumentIds.length > 0) {
      await tx.userInstrument.createMany({
        data: instrumentIds.map((id: string) => ({ userId: currentUser.id, instrumentId: id })),
      });
    }
    return tx.user.update({
      where: { id: currentUser.id },
      data: { nickname: trimmed },
      include: userInclude,
    });
  });

  return Response.json(serializeUser(user));
}
