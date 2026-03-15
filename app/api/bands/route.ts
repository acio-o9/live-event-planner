import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { bandInclude, serializeBand } from "@/lib/db/serializers";
import { CreateBandRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const bands = await prisma.band.findMany({
    include: bandInclude,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(bands.map(serializeBand));
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body: CreateBandRequest = await request.json();
  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const band = await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { sub: session.user.sub },
      update: { nickname: session.user.nickname, avatarUrl: session.user.avatarUrl ?? null },
      create: { sub: session.user.sub, nickname: session.user.nickname, avatarUrl: session.user.avatarUrl ?? null },
    });

    return tx.band.create({
      data: {
        name: body.name.trim(),
        description: body.description,
        createdBy: session.user.sub,
        members: {
          create: { userSub: session.user.sub, role: "leader" },
        },
      },
      include: bandInclude,
    });
  });

  return Response.json(serializeBand(band), { status: 201 });
}
