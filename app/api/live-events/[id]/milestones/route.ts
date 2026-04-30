import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeMilestone } from "@/lib/db/serializers";
import { CreateMilestoneRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eventExists = await prisma.liveEvent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const milestones = await prisma.milestone.findMany({
    where: { liveEventId: params.id },
    include: { tasks: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return Response.json(milestones.map(serializeMilestone));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eventExists = await prisma.liveEvent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: CreateMilestoneRequest = await request.json();
  if (!body.title?.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const count = await prisma.milestone.count({ where: { liveEventId: params.id } });

  const milestone = await prisma.milestone.create({
    data: {
      liveEventId: params.id,
      title: body.title.trim(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      order: count + 1,
    },
    include: { tasks: true },
  });

  return Response.json(serializeMilestone(milestone), { status: 201 });
}
