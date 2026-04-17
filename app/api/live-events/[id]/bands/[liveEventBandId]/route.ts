import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { UpdateEventBandRequest } from "@/lib/types";
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
  const { error } = await requireSession();
  if (error) return error;

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
