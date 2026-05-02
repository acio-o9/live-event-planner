import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeMilestone } from "@/lib/db/serializers";
import { UpdateMilestoneRequest } from "@/lib/types";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id: params.milestoneId },
    select: { id: true, liveEventId: true },
  });
  if (!milestone || milestone.liveEventId !== params.id) {
    return Response.json({ error: "Milestone not found" }, { status: 404 });
  }

  const body: UpdateMilestoneRequest = await request.json();
  const updated = await prisma.milestone.update({
    where: { id: params.milestoneId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.status !== undefined && { status: body.status }),
    },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  return Response.json(serializeMilestone(updated));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id: params.milestoneId },
    select: { id: true, liveEventId: true },
  });
  if (!milestone || milestone.liveEventId !== params.id) {
    return Response.json({ error: "Milestone not found" }, { status: 404 });
  }

  await prisma.milestone.delete({ where: { id: params.milestoneId } });

  return new Response(null, { status: 204 });
}
