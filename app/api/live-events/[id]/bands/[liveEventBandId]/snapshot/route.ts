import { requireSession } from "@/lib/api/session";
import { liveEvents } from "@/lib/store";
import { MemberSnapshot } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(
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

  if (liveEventBand.snapshotTakenAt) {
    return Response.json(
      { error: "Snapshot already taken" },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const snapshot: MemberSnapshot[] = liveEventBand.band.members.map((m) => ({
    userSub: m.userSub,
    nickname: m.user.nickname,
    role: m.role,
  }));

  liveEvents.set(params.id, {
    ...event,
    bands: event.bands.map((b) =>
      b.id === params.liveEventBandId
        ? { ...b, memberSnapshot: snapshot, snapshotTakenAt: now }
        : b
    ),
    updatedAt: now,
  });

  return Response.json({ snapshot, snapshotTakenAt: now });
}
