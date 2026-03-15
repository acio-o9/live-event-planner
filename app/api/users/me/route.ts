import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/db/serializers";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const user = await prisma.user.upsert({
    where: { sub: session.user.sub },
    update: {
      nickname: session.user.nickname,
      avatarUrl: session.user.avatarUrl ?? null,
    },
    create: {
      sub: session.user.sub,
      nickname: session.user.nickname,
      avatarUrl: session.user.avatarUrl ?? null,
    },
  });

  return Response.json(serializeUser(user));
}
