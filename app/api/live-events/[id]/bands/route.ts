import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { CreateEventBandRequest } from "@/lib/types";
import { BAND_TASK_TEMPLATES } from "@/lib/task-templates";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const eventExists = await prisma.liveEvent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: CreateEventBandRequest = await request.json();
  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const eventBand = await prisma.$transaction(async (tx) => {
    const eb = await tx.eventBand.create({
      data: {
        liveEventId: params.id,
        name: body.name.trim(),
        description: body.description,
        createdBy: userId!,
        members: {
          create: { userId: userId!, role: "leader" },
        },
      },
    });

    await tx.setlist.create({ data: { eventBandId: eb.id } });

    const milestones = await tx.milestone.findMany({
      where: { liveEventId: params.id },
      select: { id: true, order: true },
    });

    for (const tt of BAND_TASK_TEMPLATES) {
      const milestone = milestones.find((m) => m.order === tt.milestoneOrder);
      if (!milestone) continue;

      const taskCount = await tx.task.count({ where: { milestoneId: milestone.id } });
      await tx.task.create({
        data: {
          milestoneId: milestone.id,
          eventBandId: eb.id,
          title: tt.title,
          status: "pending",
          order: taskCount + 1,
        },
      });
    }

    return tx.eventBand.findUnique({
      where: { id: eb.id },
      include: eventBandInclude,
    });
  });

  return Response.json(serializeEventBand(eventBand!), { status: 201 });
}
