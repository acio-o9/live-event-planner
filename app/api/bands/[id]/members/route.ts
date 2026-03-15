import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { bandInclude, serializeBand } from "@/lib/db/serializers";
import { AddBandMemberRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const exists = await prisma.band.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: AddBandMemberRequest = await request.json();
  if (!body.userSub) {
    return Response.json({ error: "userSub is required" }, { status: 400 });
  }

  const alreadyMember = await prisma.bandMember.findUnique({
    where: { bandId_userSub: { bandId: params.id, userSub: body.userSub } },
  });
  if (alreadyMember) {
    return Response.json({ error: "Already a member" }, { status: 409 });
  }

  await prisma.bandMember.create({
    data: {
      bandId: params.id,
      userSub: body.userSub,
      role: body.role ?? "member",
    },
  });

  const band = await prisma.band.findUnique({
    where: { id: params.id },
    include: bandInclude,
  });

  return Response.json(serializeBand(band!), { status: 201 });
}
