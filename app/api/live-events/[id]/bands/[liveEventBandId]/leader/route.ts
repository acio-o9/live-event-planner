import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { UpdateBandLeaderRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
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

  const body: UpdateBandLeaderRequest = await request.json();
  if (!body.userSub) {
    return Response.json({ error: "userSub is required" }, { status: 400 });
  }

  const member = await prisma.eventBandMember.findUnique({
    where: { eventBandId_userSub: { eventBandId: params.liveEventBandId, userSub: body.userSub } },
  });
  if (!member) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.eventBandMember.updateMany({
      where: { eventBandId: params.liveEventBandId, role: "leader" },
      data: { role: "member" },
    }),
    prisma.eventBandMember.update({
      where: { eventBandId_userSub: { eventBandId: params.liveEventBandId, userSub: body.userSub } },
      data: { role: "leader" },
    }),
  ]);

  const updated = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    include: eventBandInclude,
  });

  return Response.json(serializeEventBand(updated!));
}
