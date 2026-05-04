import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireUser();
  if (error) return error;

  const eventExists = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const [events, bands] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: { liveEventId: params.id },
      orderBy: { startMin: "asc" },
    }),
    prisma.eventBand.findMany({
      where: { liveEventId: params.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return Response.json({
    events: events.map((e) => ({
      id: e.id,
      liveEventId: e.liveEventId,
      eventBandId: e.eventBandId,
      type: e.type,
      startMin: e.startMin,
      durationMin: e.durationMin,
      note: e.note,
    })),
    bands,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const eventExists = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body = await request.json();
  const { eventBandId, type, startMin, durationMin, note } = body;

  if (!["rehearsal", "performance", "other"].includes(type)) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }
  if (typeof startMin !== "number" || typeof durationMin !== "number") {
    return Response.json({ error: "startMin and durationMin must be numbers" }, { status: 400 });
  }

  const event = await prisma.timelineEvent.create({
    data: {
      liveEventId: params.id,
      eventBandId: eventBandId ?? null,
      type,
      startMin,
      durationMin,
      note: note ?? "",
    },
  });

  return Response.json(
    {
      id: event.id,
      liveEventId: event.liveEventId,
      eventBandId: event.eventBandId,
      type: event.type,
      startMin: event.startMin,
      durationMin: event.durationMin,
      note: event.note,
    },
    { status: 201 }
  );
}
