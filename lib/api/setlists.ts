import { Setlist, UpdateSetlistRequest } from "@/lib/types";

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

const base = (liveEventId: string, liveEventBandId: string) =>
  `/api/live-events/${liveEventId}/bands/${liveEventBandId}/setlist`;

export const setlistsApi = {
  get: (liveEventId: string, liveEventBandId: string) =>
    fetchJson<Setlist>(base(liveEventId, liveEventBandId)),

  update: (
    liveEventId: string,
    liveEventBandId: string,
    data: UpdateSetlistRequest
  ) =>
    fetchJson<Setlist>(base(liveEventId, liveEventBandId), {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
