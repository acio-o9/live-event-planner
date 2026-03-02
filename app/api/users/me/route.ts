import { requireSession } from "@/lib/api/session";
import { User } from "@/lib/types";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const user: User = {
    sub: session.user.sub,
    nickname: session.user.nickname,
    avatarUrl: session.user.avatarUrl,
    createdAt: new Date().toISOString(), // TODO: DB から取得
  };

  return Response.json(user);
}
