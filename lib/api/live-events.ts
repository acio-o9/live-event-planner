import {
  LiveEvent,
  Milestone,
  LiveEventBand,
  CreateLiveEventRequest,
  UpdateLiveEventRequest,
  UpdateMilestoneRequest,
  AddLiveEventBandRequest,
} from "@/lib/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const liveEventsApi = {
  list: () => fetchJson<LiveEvent[]>("/api/live-events"),

  get: (id: string) => fetchJson<LiveEvent>(`/api/live-events/${id}`),

  create: (data: CreateLiveEventRequest) =>
    fetchJson<LiveEvent>("/api/live-events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateLiveEventRequest) =>
    fetchJson<LiveEvent>(`/api/live-events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Milestones
  listMilestones: (id: string) =>
    fetchJson<Milestone[]>(`/api/live-events/${id}/milestones`),

  updateMilestone: (id: string, milestoneId: string, data: UpdateMilestoneRequest) =>
    fetchJson<Milestone>(`/api/live-events/${id}/milestones/${milestoneId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Band participation
  addBand: (id: string, data: AddLiveEventBandRequest) =>
    fetchJson<LiveEventBand>(`/api/live-events/${id}/bands`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeBand: (id: string, liveEventBandId: string) =>
    fetchJson<void>(`/api/live-events/${id}/bands/${liveEventBandId}`, {
      method: "DELETE",
    }),

  takeSnapshot: (id: string, liveEventBandId: string) =>
    fetchJson<{ snapshot: unknown; snapshotTakenAt: string }>(
      `/api/live-events/${id}/bands/${liveEventBandId}/snapshot`,
      { method: "POST" }
    ),
};
