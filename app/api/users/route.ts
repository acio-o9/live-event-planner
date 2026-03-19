import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/db/serializers";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const users = await prisma.user.findMany({ orderBy: { nickname: "asc" } });
  return Response.json(users.map(serializeUser));
}
