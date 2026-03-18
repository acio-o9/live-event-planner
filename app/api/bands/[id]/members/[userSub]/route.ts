import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { bandInclude, serializeBand } from "@/lib/db/serializers";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; userSub: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const exists = await prisma.band.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) return Response.json({ error: "Not Found" }, { status: 404 });

  const member = await prisma.bandMember.findUnique({
    where: { bandId_userSub: { bandId: params.id, userSub: params.userSub } },
  });
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 });

  await prisma.bandMember.delete({
    where: { bandId_userSub: { bandId: params.id, userSub: params.userSub } },
  });

  const band = await prisma.band.findUnique({
    where: { id: params.id },
    include: bandInclude,
  });

  return Response.json(serializeBand(band!));
}
