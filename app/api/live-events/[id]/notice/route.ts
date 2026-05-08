import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { canManageEvent } from "@/lib/permissions";
import { UpdateNoticeRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  if (!canManageEvent({ id: userId!, role: role! })) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const exists = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!exists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: UpdateNoticeRequest = await request.json();
  const notice = await prisma.liveEventNotice.upsert({
    where: { liveEventId: params.id },
    update: { content: body.content, updatedBy: userId! },
    create: { liveEventId: params.id, content: body.content, updatedBy: userId! },
  });

  return Response.json({ content: notice.content, updatedAt: notice.updatedAt.toISOString() });
}
