import { requireSession } from "@/lib/api/session";
import { liveEvents } from "@/lib/store";
import { UpdateMilestoneRequest } from "@/lib/types";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  const { error } = await requireSession();
  if (error) return error;

  const event = liveEvents.get(params.id);
  if (!event) return Response.json({ error: "Not Found" }, { status: 404 });

  const milestone = event.milestones.find((m) => m.id === params.milestoneId);
  if (!milestone) return Response.json({ error: "Milestone not found" }, { status: 404 });

  const body: UpdateMilestoneRequest = await request.json();
  const updatedMilestone = {
    ...milestone,
    ...(body.title !== undefined && { title: body.title }),
    ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
    ...(body.status !== undefined && { status: body.status }),
  };

  liveEvents.set(params.id, {
    ...event,
    milestones: event.milestones.map((m) =>
      m.id === params.milestoneId ? updatedMilestone : m
    ),
    updatedAt: new Date().toISOString(),
  });

  return Response.json(updatedMilestone);
}
