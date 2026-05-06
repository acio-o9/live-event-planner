import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { eventBandInclude, serializeEventBand } from "@/lib/db/serializers";
import { ReorderBandsRequest } from "@/lib/types";
import { canManageEvent } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "権限がありません" }, { status: 403 });
  }

  const body: ReorderBandsRequest = await request.json();
  if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
    return Response.json({ error: "orderedIds is required" }, { status: 400 });
  }

  const eventExists = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  await prisma.$transaction(
    body.orderedIds.map((bandId, index) =>
      prisma.eventBand.update({
        where: { id: bandId, liveEventId: params.id },
        data: { order: index },
      })
    )
  );

  const bands = await prisma.eventBand.findMany({
    where: { liveEventId: params.id },
    include: eventBandInclude,
    orderBy: { order: "asc" },
  });

  return Response.json(bands.map(serializeEventBand));
}
