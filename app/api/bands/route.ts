import { requireSession } from "@/lib/api/session";
import { bands, generateId } from "@/lib/store";
import { CreateBandRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  return Response.json(bands.getAll());
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body: CreateBandRequest = await request.json();
  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const band = bands.set(generateId(), {
    id: generateId(),
    name: body.name.trim(),
    description: body.description,
    members: [
      {
        userSub: session.user.sub,
        user: {
          sub: session.user.sub,
          nickname: session.user.nickname,
          avatarUrl: session.user.avatarUrl,
          createdAt: now,
        },
        role: "leader",
        joinedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  return Response.json(band, { status: 201 });
}
