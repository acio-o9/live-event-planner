import {
  LiveEvent,
  Milestone,
  EventBand,
  User,
  CreateLiveEventRequest,
  UpdateLiveEventRequest,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  CreateEventBandRequest,
  AddEventBandMemberRequest,
  UpdateBandLeaderRequest,
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

  createMilestone: (id: string, data: CreateMilestoneRequest) =>
    fetchJson<Milestone>(`/api/live-events/${id}/milestones`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMilestone: (id: string, milestoneId: string, data: UpdateMilestoneRequest) =>
    fetchJson<Milestone>(`/api/live-events/${id}/milestones/${milestoneId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMilestone: (id: string, milestoneId: string) =>
    fetchJson<void>(`/api/live-events/${id}/milestones/${milestoneId}`, {
      method: "DELETE",
    }),

  // Band
  addBand: (id: string, data: CreateEventBandRequest) =>
    fetchJson<EventBand>(`/api/live-events/${id}/bands`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBand: (id: string, eventBandId: string, data: { name?: string; description?: string }) =>
    fetchJson<EventBand>(`/api/live-events/${id}/bands/${eventBandId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  removeBand: (id: string, eventBandId: string) =>
    fetchJson<void>(`/api/live-events/${id}/bands/${eventBandId}`, {
      method: "DELETE",
    }),

  addMember: (id: string, eventBandId: string, data: AddEventBandMemberRequest) =>
    fetchJson<EventBand>(`/api/live-events/${id}/bands/${eventBandId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeMember: (id: string, eventBandId: string, userId: string) =>
    fetchJson<EventBand>(`/api/live-events/${id}/bands/${eventBandId}/members/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),

  changeLeader: (id: string, eventBandId: string, data: UpdateBandLeaderRequest) =>
    fetchJson<EventBand>(`/api/live-events/${id}/bands/${eventBandId}/leader`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  listUsers: () => fetchJson<User[]>("/api/users"),

  takeSnapshot: (id: string, eventBandId: string) =>
    fetchJson<{ snapshot: unknown; snapshotTakenAt: string }>(
      `/api/live-events/${id}/bands/${eventBandId}/snapshot`,
      { method: "POST" }
    ),
};
