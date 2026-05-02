import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { canEditBand } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string; userId: string } }
) {
  const { userId: currentUserId, role, error } = await requireUser();
  if (error) return error;

  const eb = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    select: {
      id: true,
      liveEventId: true,
      members: { where: { role: "leader" }, select: { userId: true } },
    },
  });
  if (!eb || eb.liveEventId !== params.id) {
    return Response.json({ error: "Band not found" }, { status: 404 });
  }

  const leaderUserId = eb.members[0]?.userId ?? "";
  if (!canEditBand({ id: currentUserId!, role: role! }, leaderUserId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = await prisma.eventBandMember.findUnique({
    where: { eventBandId_userId: { eventBandId: params.liveEventBandId, userId: params.userId } },
  });
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 });

  await prisma.eventBandMember.delete({
    where: { eventBandId_userId: { eventBandId: params.liveEventBandId, userId: params.userId } },
  });

  const updated = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    include: eventBandInclude,
  });

  return Response.json(serializeEventBand(updated!));
}
