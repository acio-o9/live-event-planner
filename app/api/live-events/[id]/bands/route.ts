import { requireSession } from "@/lib/api/session";
import { liveEvents, bands, generateId } from "@/lib/store";
import { AddLiveEventBandRequest, LiveEventBand, Task } from "@/lib/types";
import { BAND_TASK_TEMPLATES } from "@/lib/task-templates";
import { NextRequest } from "next/server";

function buildBandTasks(
  liveEventBandId: string,
  milestones: { id: string; order: number }[]
): { milestoneId: string; task: Task }[] {
  return BAND_TASK_TEMPLATES.flatMap((tt, idx) => {
    const milestone = milestones.find((m) => m.order === tt.milestoneOrder);
    if (!milestone) return [];
    return [
      {
        milestoneId: milestone.id,
        task: {
          id: generateId(),
          milestoneId: milestone.id,
          liveEventBandId,
          title: tt.title,
          status: "pending",
          order: idx + 1,
        },
      },
    ];
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: AddLiveEventBandRequest = await request.json();
  if (!body.bandId) {
    return Response.json({ error: "bandId is required" }, { status: 400 });
  }

  const band = bands.get(body.bandId);
  if (!band) return Response.json({ error: "Band not found" }, { status: 404 });

  const alreadyParticipating = event.bands.some((b) => b.bandId === body.bandId);
  if (alreadyParticipating) {
    return Response.json({ error: "Band already participating" }, { status: 409 });
  }

  const liveEventBandId = generateId();
  const now = new Date().toISOString();

  const liveEventBand: LiveEventBand = {
    id: liveEventBandId,
    liveEventId: params.id,
    bandId: body.bandId,
    band,
    memberSnapshot: [],
    setlist: {
      id: generateId(),
      liveEventBandId,
      songs: [],
      updatedAt: now,
    },
  };

  // バンド個別タスクを対応するマイルストーンに追加
  const bandTasks = buildBandTasks(
    liveEventBandId,
    event.milestones.map((m) => ({ id: m.id, order: m.order }))
  );

  const updatedMilestones = event.milestones.map((m) => {
    const newTasks = bandTasks
      .filter((bt) => bt.milestoneId === m.id)
      .map((bt) => bt.task);
    return newTasks.length > 0
      ? { ...m, tasks: [...m.tasks, ...newTasks] }
      : m;
  });

  liveEvents.set(params.id, {
    ...event,
    bands: [...event.bands, liveEventBand],
    milestones: updatedMilestones,
    updatedAt: now,
  });

  return Response.json(liveEventBand, { status: 201 });
}
