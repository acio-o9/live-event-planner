import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { calcExpenseSummary } from "@/lib/expense-utils";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    include: {
      expenses: { include: { paidByUser: true } },
      bands: {
        include: {
          snapshots: true,
          members: { include: { user: true } },
        },
      },
    },
  });
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  // 参加者一覧: スナップショットがあればそちらを優先、なければバンドメンバーを使用（重複除去）
  const participantMap = new Map<string, string>();
  for (const band of event.bands) {
    if (band.snapshots.length > 0) {
      for (const snap of band.snapshots) {
        participantMap.set(snap.userSub, snap.nickname);
      }
    } else {
      for (const member of band.members) {
        participantMap.set(member.userSub, member.user.nickname);
      }
    }
  }

  const participants = Array.from(participantMap.entries()).map(([userSub, nickname]) => ({
    userSub,
    nickname,
  }));

  const expenses = event.expenses.map((e) => ({
    paidBy: e.paidBy,
    paidByNickname: e.paidByUser.nickname,
    amount: e.amount,
  }));

  return Response.json(calcExpenseSummary(expenses, participants));
}
