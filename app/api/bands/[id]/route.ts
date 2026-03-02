import { requireSession } from "@/lib/api/session";
import { bands } from "@/lib/store";
import { UpdateBandRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const band = bands.get(params.id);
  if (!band) return Response.json({ error: "Not Found" }, { status: 404 });

  return Response.json(band);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const band = bands.get(params.id);
  if (!band) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: UpdateBandRequest = await request.json();
  const updated = bands.set(params.id, {
    ...band,
    ...(body.name !== undefined && { name: body.name.trim() }),
    ...(body.description !== undefined && { description: body.description }),
    updatedAt: new Date().toISOString(),
  });

  return Response.json(updated);
}
