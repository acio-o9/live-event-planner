import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { liveEventBandInclude, serializeLiveEventBand } from "@/lib/db/serializers";
import { AddLiveEventBandRequest } from "@/lib/types";
import { BAND_TASK_TEMPLATES } from "@/lib/task-templates";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eventExists = await prisma.liveEvent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: AddLiveEventBandRequest = await request.json();
  if (!body.bandId) {
    return Response.json({ error: "bandId is required" }, { status: 400 });
  }

  const bandExists = await prisma.band.findUnique({ where: { id: body.bandId }, select: { id: true } });
  if (!bandExists) return Response.json({ error: "Band not found" }, { status: 404 });

  const alreadyParticipating = await prisma.liveEventBand.findUnique({
    where: { liveEventId_bandId: { liveEventId: params.id, bandId: body.bandId } },
  });
  if (alreadyParticipating) {
    return Response.json({ error: "Band already participating" }, { status: 409 });
  }

  const liveEventBand = await prisma.$transaction(async (tx) => {
    const leb = await tx.liveEventBand.create({
      data: { liveEventId: params.id, bandId: body.bandId },
    });

    await tx.setlist.create({ data: { liveEventBandId: leb.id } });

    const milestones = await tx.milestone.findMany({
      where: { liveEventId: params.id },
      select: { id: true, order: true },
    });

    for (let i = 0; i < BAND_TASK_TEMPLATES.length; i++) {
      const tt = BAND_TASK_TEMPLATES[i];
      const milestone = milestones.find((m) => m.order === tt.milestoneOrder);
      if (!milestone) continue;

      const taskCount = await tx.task.count({ where: { milestoneId: milestone.id } });
      await tx.task.create({
        data: {
          milestoneId: milestone.id,
          liveEventBandId: leb.id,
          title: tt.title,
          status: "pending",
          order: taskCount + 1,
        },
      });
    }

    return tx.liveEventBand.findUnique({
      where: { id: leb.id },
      include: liveEventBandInclude,
    });
  });

  return Response.json(serializeLiveEventBand(liveEventBand!), { status: 201 });
}
