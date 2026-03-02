import { requireSession } from "@/lib/api/session";
import { liveEvents, generateId } from "@/lib/store";
import { CreateTaskRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const milestone = event.milestones.find((m) => m.id === params.milestoneId);
  if (!milestone) return Response.json({ error: "Milestone not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const liveEventBandId = searchParams.get("liveEventBandId");

  const tasks = liveEventBandId
    ? milestone.tasks.filter((t) => t.liveEventBandId === liveEventBandId)
    : milestone.tasks;

  return Response.json(tasks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const milestone = event.milestones.find((m) => m.id === params.milestoneId);
  if (!milestone) return Response.json({ error: "Milestone not found" }, { status: 404 });

  const body: CreateTaskRequest = await request.json();
  if (!body.title?.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const newTask = {
    id: generateId(),
    milestoneId: params.milestoneId,
    liveEventBandId: body.liveEventBandId,
    title: body.title.trim(),
    assigneeUserSub: body.assigneeUserSub,
    status: "pending" as const,
    order: milestone.tasks.length + 1,
  };

  liveEvents.set(params.id, {
    ...event,
    milestones: event.milestones.map((m) =>
      m.id === params.milestoneId
        ? { ...m, tasks: [...m.tasks, newTask] }
        : m
    ),
    updatedAt: new Date().toISOString(),
  });

  return Response.json(newTask, { status: 201 });
}
