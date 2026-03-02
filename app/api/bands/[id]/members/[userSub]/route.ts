import { requireSession } from "@/lib/api/session";
import { bands } from "@/lib/store";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; userSub: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const band = bands.get(params.id);
  if (!band) return Response.json({ error: "Not Found" }, { status: 404 });

  const memberExists = band.members.some((m) => m.userSub === params.userSub);
  if (!memberExists) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = bands.set(params.id, {
    ...band,
    members: band.members.filter((m) => m.userSub !== params.userSub),
    updatedAt: new Date().toISOString(),
  });

  return Response.json(updated);
}
