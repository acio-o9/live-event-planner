import { requireSession } from "@/lib/api/session";
import { bands } from "@/lib/store";
import { AddBandMemberRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const band = bands.get(params.id);
  if (!band) return Response.json({ error: "Not Found" }, { status: 404 });

  const body: AddBandMemberRequest = await request.json();
  if (!body.userSub) {
    return Response.json({ error: "userSub is required" }, { status: 400 });
  }

  const alreadyMember = band.members.some((m) => m.userSub === body.userSub);
  if (alreadyMember) {
    return Response.json({ error: "Already a member" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const updated = bands.set(params.id, {
    ...band,
    members: [
      ...band.members,
      {
        userSub: body.userSub,
        user: {
          sub: body.userSub,
          nickname: body.userSub, // TODO: ユーザーDBから取得
          createdAt: now,
        },
        role: body.role ?? "member",
        joinedAt: now,
      },
    ],
    updatedAt: now,
  });

  return Response.json(updated, { status: 201 });
}
