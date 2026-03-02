import { requireSession } from "@/lib/api/session";
import { liveEvents } from "@/lib/store";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const bandParticipation = event.bands.find(
    (b) => b.id === params.liveEventBandId
  );
  if (!bandParticipation) {
    return Response.json({ error: "Band participation not found" }, { status: 404 });
  }

  // バンド個別タスクも合わせて削除
  const updatedMilestones = event.milestones.map((m) => ({
    ...m,
    tasks: m.tasks.filter(
      (t) => t.liveEventBandId !== params.liveEventBandId
    ),
  }));

  liveEvents.set(params.id, {
    ...event,
    bands: event.bands.filter((b) => b.id !== params.liveEventBandId),
    milestones: updatedMilestones,
    updatedAt: new Date().toISOString(),
  });

  return new Response(null, { status: 204 });
}
