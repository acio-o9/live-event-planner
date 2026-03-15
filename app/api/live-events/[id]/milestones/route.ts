import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeMilestone } from "@/lib/db/serializers";
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
