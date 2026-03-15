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

  const leb = await prisma.liveEventBand.findUnique({
    where: { id: params.liveEventBandId },
    include: {
      band: { include: { members: { include: { user: true } } } },
      snapshots: true,
    },
  });
  if (!leb || leb.liveEventId !== params.id) {
    return Response.json({ error: "Band participation not found" }, { status: 404 });
  }

  if (leb.snapshotTakenAt) {
    return Response.json({ error: "Snapshot already taken" }, { status: 409 });
  }

  const now = new Date();
  const snapshots = await prisma.$transaction(async (tx) => {
    await tx.liveEventBand.update({
      where: { id: params.liveEventBandId },
      data: { snapshotTakenAt: now },
    });

    const created = await tx.memberSnapshot.createMany({
      data: leb.band.members.map((m) => ({
        liveEventBandId: params.liveEventBandId,
        userSub: m.userSub,
        nickname: m.user.nickname,
        role: m.role,
      })),
    });

    return tx.memberSnapshot.findMany({
      where: { liveEventBandId: params.liveEventBandId },
    });
  });

  return Response.json({
    snapshot: snapshots.map(serializeMemberSnapshot),
    snapshotTakenAt: now.toISOString(),
  });
}
