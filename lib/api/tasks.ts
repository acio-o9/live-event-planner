import { Task, CreateTaskRequest, UpdateTaskRequest } from "@/lib/types";

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

const base = (liveEventId: string, milestoneId: string) =>
  `/api/live-events/${liveEventId}/milestones/${milestoneId}/tasks`;

export const tasksApi = {
  list: (liveEventId: string, milestoneId: string, eventBandId?: string) => {
    const url = new URL(base(liveEventId, milestoneId), window.location.origin);
    if (eventBandId) url.searchParams.set("eventBandId", eventBandId);
    return fetchJson<Task[]>(url.pathname + url.search);
  },

  create: (liveEventId: string, milestoneId: string, data: CreateTaskRequest) =>
    fetchJson<Task>(base(liveEventId, milestoneId), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    liveEventId: string,
    milestoneId: string,
    taskId: string,
    data: UpdateTaskRequest
  ) =>
    fetchJson<Task>(`${base(liveEventId, milestoneId)}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (liveEventId: string, milestoneId: string, taskId: string) =>
    fetchJson<void>(`${base(liveEventId, milestoneId)}/${taskId}`, {
      method: "DELETE",
    }),
};
