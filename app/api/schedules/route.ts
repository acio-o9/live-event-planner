import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeBandSchedule } from "@/lib/db/serializers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam
    ? new Date(fromParam)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = toParam
    ? new Date(toParam)
    : new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

  const schedules = await prisma.bandSchedule.findMany({
    where: {
      startAt: { gte: from, lte: to },
    },
    include: { band: { select: { name: true } } },
    orderBy: { startAt: "asc" },
  });

  return Response.json({ schedules: schedules.map(serializeBandSchedule) });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { bandId, location, startAt, endAt } = body;

  if (!bandId) return Response.json({ error: "bandId is required" }, { status: 400 });
  if (!location) return Response.json({ error: "location is required" }, { status: 400 });
  if (!startAt) return Response.json({ error: "startAt is required" }, { status: 400 });
  if (!endAt) return Response.json({ error: "endAt is required" }, { status: 400 });
  if (new Date(endAt) <= new Date(startAt)) {
    return Response.json({ error: "endAt must be after startAt" }, { status: 400 });
  }

  // バンドメンバーシップ確認
  const membership = await prisma.bandMember.findUnique({
    where: { bandId_userSub: { bandId, userSub: session.user.sub } },
  });
  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const schedule = await prisma.bandSchedule.create({
    data: {
      bandId,
      location,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      createdBy: session.user.sub,
    },
    include: { band: { select: { name: true } } },
  });

  return Response.json(serializeBandSchedule(schedule), { status: 201 });
}
