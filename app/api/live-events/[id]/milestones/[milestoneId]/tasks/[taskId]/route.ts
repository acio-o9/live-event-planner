import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/db/serializers";
import { UpdateTaskRequest } from "@/lib/types";
import { canManageEvent, canUpdateTaskStatus } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string; taskId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    select: {
      id: true,
      milestoneId: true,
      assigneeUserId: true,
      milestone: { select: { liveEventId: true } },
    },
  });
  if (!task || task.milestoneId !== params.milestoneId || task.milestone.liveEventId !== params.id) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const body: UpdateTaskRequest = await request.json();

  const isStatusOnlyUpdate = body.status !== undefined && body.title === undefined && body.assigneeUserId === undefined;
  if (isStatusOnlyUpdate) {
    if (!canUpdateTaskStatus({ id: userId!, role: role! }, task.assigneeUserId)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    if (!canManageEvent({ id: userId!, role: role! })) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.assigneeUserId !== undefined && {
        assigneeUserId: body.assigneeUserId ?? null,
      }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return Response.json(serializeTask(updated));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; milestoneId: string; taskId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    select: { id: true, milestoneId: true, milestone: { select: { liveEventId: true } } },
  });
  if (!task || task.milestoneId !== params.milestoneId || task.milestone.liveEventId !== params.id) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: params.taskId } });

  return new Response(null, { status: 204 });
}
