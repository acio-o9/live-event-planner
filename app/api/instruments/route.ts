import { requireSession } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { serializeInstrument } from "@/lib/db/serializers";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const instruments = await prisma.instrument.findMany({
    orderBy: { order: "asc" },
  });
  return Response.json(instruments.map(serializeInstrument));
}
