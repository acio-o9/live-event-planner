import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { liveEventInclude, serializeLiveEvent } from "@/lib/db/serializers";
import { CreateLiveEventRequest } from "@/lib/types";
import { MILESTONE_TEMPLATES, EVENT_TASK_TEMPLATES, calcDueDate } from "@/lib/task-templates";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const events = await prisma.liveEvent.findMany({
    include: liveEventInclude,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(events.map(serializeLiveEvent));
}

export async function POST(request: NextRequest) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: CreateLiveEventRequest = await request.json();
  if (!body.title?.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const event = await prisma.$transaction(async (tx) => {

    const liveEvent = await tx.liveEvent.create({
      data: {
        title: body.title.trim(),
        description: body.description,
        date: body.date ? new Date(body.date) : null,
        venue: body.venue,
        status: "planning",
        createdBy: userId!,
      },
    });

    for (const mt of MILESTONE_TEMPLATES) {
      const dueDate = body.date ? new Date(calcDueDate(body.date, mt.offsetDays)) : null;
      const milestone = await tx.milestone.create({
        data: {
          liveEventId: liveEvent.id,
          title: mt.title,
          dueDate,
          status: "pending",
          order: mt.order,
        },
      });

      const eventTasks = EVENT_TASK_TEMPLATES.filter((tt) => tt.milestoneOrder === mt.order);
      for (let i = 0; i < eventTasks.length; i++) {
        await tx.task.create({
          data: {
            milestoneId: milestone.id,
            title: eventTasks[i].title,
            status: "pending",
            order: i + 1,
          },
        });
      }
    }

    return tx.liveEvent.findUnique({
      where: { id: liveEvent.id },
      include: liveEventInclude,
    });
  });

  return Response.json(serializeLiveEvent(event!), { status: 201 });
}
