import { requireSession } from "@/lib/api/session";
import { liveEvents } from "@/lib/store";
import { UpdateSetlistRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const liveEventBand = event.bands.find(
    (b) => b.id === params.liveEventBandId
  );
  if (!liveEventBand) {
    return Response.json({ error: "Band participation not found" }, { status: 404 });
  }

  return Response.json(liveEventBand.setlist);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const liveEventBand = event.bands.find(
    (b) => b.id === params.liveEventBandId
  );
  if (!liveEventBand) {
    return Response.json({ error: "Band participation not found" }, { status: 404 });
  }

  const body: UpdateSetlistRequest = await request.json();
  const now = new Date().toISOString();
  const updatedSetlist = {
    ...liveEventBand.setlist,
    songs: body.songs,
    updatedAt: now,
  };

  liveEvents.set(params.id, {
    ...event,
    bands: event.bands.map((b) =>
      b.id === params.liveEventBandId
        ? { ...b, setlist: updatedSetlist }
        : b
    ),
    updatedAt: now,
  });

  return Response.json(updatedSetlist);
}
