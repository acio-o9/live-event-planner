import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { UpdateEventBandRequest } from "@/lib/types";
import { canEditBand, canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { userId, role, error } = await requireUser();
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
  if (!canEditBand({ id: userId!, role: role! }, leaderUserId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: UpdateEventBandRequest = await request.json();
  const updated = await prisma.eventBand.update({
    where: { id: params.liveEventBandId },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
    },
    include: eventBandInclude,
  });

  return Response.json(serializeEventBand(updated));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const eb = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    select: { id: true, liveEventId: true },
  });
  if (!eb || eb.liveEventId !== params.id) {
    return Response.json({ error: "Band not found" }, { status: 404 });
  }

  // onDelete: Cascade handles members, snapshots, setlist, tasks automatically
  await prisma.eventBand.delete({ where: { id: params.liveEventBandId } });

  return new Response(null, { status: 204 });
}
