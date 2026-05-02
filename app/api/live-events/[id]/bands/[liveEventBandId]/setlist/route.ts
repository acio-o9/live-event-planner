import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeSetlist } from "@/lib/db/serializers";
import { UpdateSetlistRequest } from "@/lib/types";
import { canEditSetlist } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { error } = await requireUser();
  if (error) return error;

  const eb = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    select: { liveEventId: true },
  });
  if (!eb || eb.liveEventId !== params.id) {
    return Response.json({ error: "Band not found" }, { status: 404 });
  }

  const setlist = await prisma.setlist.findUnique({
    where: { eventBandId: params.liveEventBandId },
    include: { songs: { orderBy: { order: "asc" } } },
  });
  if (!setlist) return Response.json({ error: "Setlist not found" }, { status: 404 });

  return Response.json(serializeSetlist(setlist));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  const eb = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    select: {
      liveEventId: true,
      members: { select: { userId: true } },
    },
  });
  if (!eb || eb.liveEventId !== params.id) {
    return Response.json({ error: "Band not found" }, { status: 404 });
  }

  const memberUserIds = eb.members.map((m) => m.userId);
  if (!canEditSetlist({ id: userId!, role: role! }, memberUserIds)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: UpdateSetlistRequest = await request.json();

  const setlist = await prisma.$transaction(async (tx) => {
    const existing = await tx.setlist.findUnique({
      where: { eventBandId: params.liveEventBandId },
      select: { id: true },
    });
    if (!existing) return null;

    await tx.setlistSong.deleteMany({ where: { setlistId: existing.id } });

    if (body.songs.length > 0) {
      await tx.setlistSong.createMany({
        data: body.songs.map((s) => ({
          setlistId: existing.id,
          title: s.title,
          duration: s.duration ?? null,
          order: s.order,
          note: s.note ?? null,
        })),
      });
    }

    return tx.setlist.findUnique({
      where: { id: existing.id },
      include: { songs: { orderBy: { order: "asc" } } },
    });
  });

  if (!setlist) return Response.json({ error: "Setlist not found" }, { status: 404 });

  return Response.json(serializeSetlist(setlist));
}
