import { requireSession } from "@/lib/api/session";
import { liveEvents } from "@/lib/store";
import { UpdateLiveEventRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  return Response.json(event);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: UpdateLiveEventRequest = await request.json();
  const updated = liveEvents.set(params.id, {
    ...event,
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.date !== undefined && { date: body.date }),
    ...(body.venue !== undefined && { venue: body.venue }),
    ...(body.photoAlbumUrl !== undefined && { photoAlbumUrl: body.photoAlbumUrl }),
    ...(body.status !== undefined && { status: body.status }),
    updatedAt: new Date().toISOString(),
  });

  return Response.json(updated);
}
