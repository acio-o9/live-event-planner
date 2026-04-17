import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeMemberSnapshot } from "@/lib/db/serializers";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eventBand = await prisma.eventBand.findUnique({
    where: { id: params.liveEventBandId },
    include: {
      members: { include: { user: true } },
      snapshots: true,
    },
  });
  if (!eventBand || eventBand.liveEventId !== params.id) {
    return Response.json({ error: "Band not found" }, { status: 404 });
  }

  if (eventBand.snapshots.length > 0) {
    return Response.json({ error: "Snapshot already taken" }, { status: 409 });
  }

  const now = new Date();
  const snapshots = await prisma.$transaction(async (tx) => {
    await tx.memberSnapshot.createMany({
      data: eventBand.members.map((m) => ({
        eventBandId: params.liveEventBandId,
        userSub: m.userSub,
        nickname: m.user.nickname,
        role: m.role,
      })),
    });

    return tx.memberSnapshot.findMany({
      where: { eventBandId: params.liveEventBandId },
    });
  });

  return Response.json({
    snapshot: snapshots.map(serializeMemberSnapshot),
    snapshotTakenAt: now.toISOString(),
  });
}
