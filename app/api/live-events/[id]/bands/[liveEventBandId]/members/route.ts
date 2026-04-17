import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { AddEventBandMemberRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(
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

  const body: AddEventBandMemberRequest = await request.json();
  if (!body.userSub) {
    return Response.json({ error: "userSub is required" }, { status: 400 });
  }

  const alreadyMember = await prisma.eventBandMember.findUnique({
    where: { eventBandId_userSub: { eventBandId: params.liveEventBandId, userSub: body.userSub } },
  });
  if (alreadyMember) {
    return Response.json({ error: "Already a member" }, { status: 409 });
  }

  await prisma.eventBandMember.create({
    data: {
      eventBandId: params.liveEventBandId,
      userSub: body.userSub,
      role: body.role ?? "member",
    },
  });

  const updated = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    include: eventBandInclude,
  });

  return Response.json(serializeEventBand(updated!), { status: 201 });
}
