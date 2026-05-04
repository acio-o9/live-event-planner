import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.timelineEvent.findUnique({
    where: { id: params.eventId },
  });
  if (!existing || existing.liveEventId !== params.id) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  const body = await request.json();
  const { eventBandId, type, startMin, durationMin, note } = body;

  if (type !== undefined && !["rehearsal", "performance", "other"].includes(type)) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  const updated = await prisma.timelineEvent.update({
    where: { id: params.eventId },
    data: {
      ...(eventBandId !== undefined && { eventBandId: eventBandId }),
      ...(type !== undefined && { type }),
      ...(startMin !== undefined && { startMin }),
      ...(durationMin !== undefined && { durationMin }),
      ...(note !== undefined && { note }),
    },
  });

  return Response.json({
    id: updated.id,
    liveEventId: updated.liveEventId,
    eventBandId: updated.eventBandId,
    type: updated.type,
    startMin: updated.startMin,
    durationMin: updated.durationMin,
    note: updated.note,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.timelineEvent.findUnique({
    where: { id: params.eventId },
  });
  if (!existing || existing.liveEventId !== params.id) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  await prisma.timelineEvent.delete({ where: { id: params.eventId } });
  return new Response(null, { status: 204 });
}
