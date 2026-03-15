import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/db/serializers";
import { UpdateTaskRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string; taskId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    select: { id: true, milestoneId: true, milestone: { select: { liveEventId: true } } },
  });
  if (!task || task.milestoneId !== params.milestoneId || task.milestone.liveEventId !== params.id) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const body: UpdateTaskRequest = await request.json();
  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.assigneeUserSub !== undefined && {
        assigneeUserSub: body.assigneeUserSub ?? null,
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
  const { error } = await requireSession();
  if (error) return error;

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
