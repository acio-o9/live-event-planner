import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeExpense } from "@/lib/db/serializers";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eventExists = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const expenses = await prisma.expense.findMany({
    where: { liveEventId: params.id },
    include: { paidByUser: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ expenses: expenses.map(serializeExpense) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const eventExists = await prisma.liveEvent.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!eventExists) return Response.json({ error: "Not Found" }, { status: 404 });

  const body = await request.json();
  const { paidBy, amount, category, description } = body;

  if (!paidBy) return Response.json({ error: "paidBy is required" }, { status: 400 });
  if (typeof amount !== "number" || amount <= 0)
    return Response.json({ error: "amount must be a positive number" }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      liveEventId: params.id,
      paidBy,
      amount: Math.floor(amount),
      category: category ?? "その他",
      description: description ?? "",
    },
    include: { paidByUser: true },
  });

  return Response.json(serializeExpense(expense), { status: 201 });
}
