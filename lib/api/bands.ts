import {
  Band,
  CreateBandRequest,
  UpdateBandRequest,
  AddBandMemberRequest,
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

export const bandsApi = {
  list: () => fetchJson<Band[]>("/api/bands"),

  get: (id: string) => fetchJson<Band>(`/api/bands/${id}`),

  create: (data: CreateBandRequest) =>
    fetchJson<Band>("/api/bands", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateBandRequest) =>
    fetchJson<Band>(`/api/bands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  addMember: (id: string, data: AddBandMemberRequest) =>
    fetchJson<Band>(`/api/bands/${id}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeMember: (id: string, userSub: string) =>
    fetchJson<Band>(`/api/bands/${id}/members/${encodeURIComponent(userSub)}`, {
      method: "DELETE",
    }),
};
