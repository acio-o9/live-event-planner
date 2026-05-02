import { requireUser } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeExpense } from "@/lib/db/serializers";
import { canEditExpense } from "@/lib/permissions";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  const existing = await prisma.expense.findUnique({
    where: { id: params.expenseId },
  });
  if (!existing || existing.liveEventId !== params.id)
    return Response.json({ error: "Not Found" }, { status: 404 });

  if (!canEditExpense({ id: userId!, role: role! }, existing.paidBy)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { paidBy, amount, category, description } = body;

  if (amount !== undefined && (typeof amount !== "number" || amount <= 0))
    return Response.json({ error: "amount must be a positive number" }, { status: 400 });

  const expense = await prisma.expense.update({
    where: { id: params.expenseId },
    data: {
      ...(paidBy !== undefined && { paidBy }),
      ...(amount !== undefined && { amount: Math.floor(amount) }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
    },
    include: { paidByUser: true },
  });

  return Response.json(serializeExpense(expense));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  const { userId, role, error } = await requireUser();
  if (error) return error;

  const existing = await prisma.expense.findUnique({
    where: { id: params.expenseId },
  });
  if (!existing || existing.liveEventId !== params.id)
    return Response.json({ error: "Not Found" }, { status: 404 });

  if (!canEditExpense({ id: userId!, role: role! }, existing.paidBy)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.expense.delete({ where: { id: params.expenseId } });
  return new Response(null, { status: 204 });
}
