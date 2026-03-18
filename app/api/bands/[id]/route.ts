import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { bandInclude, serializeBand } from "@/lib/db/serializers";
import { UpdateBandRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const band = await prisma.band.findUnique({
    where: { id: params.id },
    include: bandInclude,
  });
  if (!band) return Response.json({ error: "Not Found" }, { status: 404 });

  return Response.json(serializeBand(band));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const exists = await prisma.band.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: UpdateBandRequest = await request.json();
  const band = await prisma.band.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
    },
    include: bandInclude,
  });

  return Response.json(serializeBand(band));
}
