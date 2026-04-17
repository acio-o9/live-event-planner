import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const schedule = await prisma.bandSchedule.findUnique({
    where: { id: params.scheduleId },
  });
  if (!schedule) return Response.json({ error: "Not Found" }, { status: 404 });

  // バンドメンバーシップ確認
  const membership = await prisma.eventBandMember.findUnique({
    where: { eventBandId_userSub: { eventBandId: schedule.eventBandId, userSub: session.user.sub } },
  });
  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.bandSchedule.delete({ where: { id: params.scheduleId } });
  return new Response(null, { status: 204 });
}
