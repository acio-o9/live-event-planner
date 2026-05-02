import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { liveEventInclude, serializeLiveEvent } from "@/lib/db/serializers";
import { UpdateLiveEventRequest } from "@/lib/types";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireUser();
  if (error) return error;

  const event = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    include: liveEventInclude,
  });
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  return Response.json(serializeLiveEvent(event));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const exists = await prisma.liveEvent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: UpdateLiveEventRequest = await request.json();
  const event = await prisma.liveEvent.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.date !== undefined && { date: body.date ? new Date(body.date) : null }),
      ...(body.venue !== undefined && { venue: body.venue }),
      ...(body.photoAlbumUrl !== undefined && { photoAlbumUrl: body.photoAlbumUrl }),
      ...(body.status !== undefined && { status: body.status }),
    },
    include: liveEventInclude,
  });

  return Response.json(serializeLiveEvent(event));
}
