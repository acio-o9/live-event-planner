import {
  EventBand,
  CreateEventBandRequest,
  UpdateEventBandRequest,
  AddEventBandMemberRequest,
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
  return res.json();
}

const base = (liveEventId: string) => `/api/live-events/${liveEventId}/bands`;

export const bandsApi = {
  create: (liveEventId: string, data: CreateEventBandRequest) =>
    fetchJson<EventBand>(base(liveEventId), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (liveEventId: string, eventBandId: string, data: UpdateEventBandRequest) =>
    fetchJson<EventBand>(`${base(liveEventId)}/${eventBandId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (liveEventId: string, eventBandId: string) =>
    fetchJson<void>(`${base(liveEventId)}/${eventBandId}`, {
      method: "DELETE",
    }),

  addMember: (liveEventId: string, eventBandId: string, data: AddEventBandMemberRequest) =>
    fetchJson<EventBand>(`${base(liveEventId)}/${eventBandId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeMember: (liveEventId: string, eventBandId: string, userSub: string) =>
    fetchJson<EventBand>(
      `${base(liveEventId)}/${eventBandId}/members/${encodeURIComponent(userSub)}`,
      { method: "DELETE" }
    ),
};
