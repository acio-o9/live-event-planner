import { requireSession } from "@/lib/api/session";
import { liveEvents } from "@/lib/store";
import { UpdateTaskRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string; taskId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const milestone = event.milestones.find((m) => m.id === params.milestoneId);
  if (!milestone) return Response.json({ error: "Milestone not found" }, { status: 404 });

  const task = milestone.tasks.find((t) => t.id === params.taskId);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });

  const body: UpdateTaskRequest = await request.json();
  const updatedTask = {
    ...task,
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.assigneeUserSub !== undefined && {
      assigneeUserSub: body.assigneeUserSub ?? undefined,
    }),
    ...(body.status !== undefined && { status: body.status }),
  };

  liveEvents.set(params.id, {
    ...event,
    milestones: event.milestones.map((m) =>
      m.id === params.milestoneId
        ? { ...m, tasks: m.tasks.map((t) => (t.id === params.taskId ? updatedTask : t)) }
        : m
    ),
    updatedAt: new Date().toISOString(),
  });

  return Response.json(updatedTask);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; milestoneId: string; taskId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const milestone = event.milestones.find((m) => m.id === params.milestoneId);
  if (!milestone) return Response.json({ error: "Milestone not found" }, { status: 404 });

  liveEvents.set(params.id, {
    ...event,
    milestones: event.milestones.map((m) =>
      m.id === params.milestoneId
        ? { ...m, tasks: m.tasks.filter((t) => t.id !== params.taskId) }
        : m
    ),
    updatedAt: new Date().toISOString(),
  });

  return new Response(null, { status: 204 });
}
