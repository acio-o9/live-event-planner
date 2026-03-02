import { requireSession } from "@/lib/api/session";
import { liveEvents, generateId } from "@/lib/store";
import { CreateLiveEventRequest, LiveEvent, Milestone, Task } from "@/lib/types";
import {
  MILESTONE_TEMPLATES,
  EVENT_TASK_TEMPLATES,
  calcDueDate,
} from "@/lib/task-templates";
import { NextRequest } from "next/server";

function buildMilestonesWithTasks(eventDate?: string): Milestone[] {
  return MILESTONE_TEMPLATES.map((mt) => {
    const dueDate = eventDate ? calcDueDate(eventDate, mt.offsetDays) : undefined;
    const tasks: Task[] = EVENT_TASK_TEMPLATES.filter(
      (tt) => tt.milestoneOrder === mt.order
    ).map((tt, idx) => ({
      id: generateId(),
      milestoneId: "", // 後で上書き
      title: tt.title,
      status: "pending",
      order: idx + 1,
    }));

    const milestoneId = generateId();
    return {
      id: milestoneId,
      liveEventId: "", // 後で上書き
      title: mt.title,
      dueDate,
      status: "pending",
      order: mt.order,
      tasks: tasks.map((t) => ({ ...t, milestoneId })),
    };
  });
}

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  return Response.json(liveEvents.getAll());
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body: CreateLiveEventRequest = await request.json();
  if (!body.title?.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const id = generateId();
  const now = new Date().toISOString();
  const milestones = buildMilestonesWithTasks(body.date).map((m) => ({
    ...m,
    liveEventId: id,
  }));

  const liveEvent: LiveEvent = {
    id,
    title: body.title.trim(),
    description: body.description,
    date: body.date,
    venue: body.venue,
    bands: [],
    milestones,
    status: "planning",
    createdBy: session.user.sub,
    createdAt: now,
    updatedAt: now,
  };

  liveEvents.set(id, liveEvent);
  return Response.json(liveEvent, { status: 201 });
}
