import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/db/serializers";
import { CreateTaskRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const milestone = await prisma.milestone.findUnique({
    where: { id: params.milestoneId },
    select: { id: true, liveEventId: true },
  });
  if (!milestone || milestone.liveEventId !== params.id) {
    return Response.json({ error: "Milestone not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const liveEventBandId = searchParams.get("liveEventBandId");

  const tasks = await prisma.task.findMany({
    where: {
      milestoneId: params.milestoneId,
      ...(liveEventBandId ? { liveEventBandId } : {}),
    },
    orderBy: { order: "asc" },
  });

  return Response.json(tasks.map(serializeTask));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const milestone = await prisma.milestone.findUnique({
    where: { id: params.milestoneId },
    select: { id: true, liveEventId: true },
  });
  if (!milestone || milestone.liveEventId !== params.id) {
    return Response.json({ error: "Milestone not found" }, { status: 404 });
  }

  const body: CreateTaskRequest = await request.json();
  if (!body.title?.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const taskCount = await prisma.task.count({ where: { milestoneId: params.milestoneId } });
  const task = await prisma.task.create({
    data: {
      milestoneId: params.milestoneId,
      liveEventBandId: body.liveEventBandId ?? null,
      title: body.title.trim(),
      assigneeUserSub: body.assigneeUserSub ?? null,
      status: "pending",
      order: taskCount + 1,
    },
  });

  return Response.json(serializeTask(task), { status: 201 });
}
