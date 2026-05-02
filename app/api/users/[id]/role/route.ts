import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeUser, userInclude } from "@/lib/db/serializers";
import { canChangeUserRole } from "@/lib/permissions";
import type { UpdateUserRoleRequest, UserRole } from "@/lib/types";

const VALID_ROLES: UserRole[] = ["admin", "honki_kanrinin", "user"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role: targetRole } = body as UpdateUserRoleRequest;

  if (!VALID_ROLES.includes(targetRole)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!canChangeUserRole({ id: userId!, role: role! }, targetRole)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.deletedAt !== null) {
    return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: targetRole },
    include: userInclude,
  });

  return Response.json(serializeUser(updated));
}
