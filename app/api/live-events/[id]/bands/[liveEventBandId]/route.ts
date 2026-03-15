import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; liveEventBandId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const leb = await prisma.liveEventBand.findUnique({
    where: { id: params.liveEventBandId },
    select: { id: true, liveEventId: true },
  });
  if (!leb || leb.liveEventId !== params.id) {
    return Response.json({ error: "Band participation not found" }, { status: 404 });
  }

  // onDelete: Cascade handles tasks and setlist automatically
  await prisma.liveEventBand.delete({ where: { id: params.liveEventBandId } });

  return new Response(null, { status: 204 });
}
