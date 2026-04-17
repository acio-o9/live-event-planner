import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string; userSub: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eb = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    select: { id: true, liveEventId: true },
  });
  if (!eb || eb.liveEventId !== params.id) {
    return Response.json({ error: "Band not found" }, { status: 404 });
  }

  const member = await prisma.eventBandMember.findUnique({
    where: { eventBandId_userSub: { eventBandId: params.liveEventBandId, userSub: params.userSub } },
  });
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 });

  await prisma.eventBandMember.delete({
    where: { eventBandId_userSub: { eventBandId: params.liveEventBandId, userSub: params.userSub } },
  });

  const updated = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    include: eventBandInclude,
  });

  return Response.json(serializeEventBand(updated!));
}
