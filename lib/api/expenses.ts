import {
  Expense,
  ExpenseSummary,
  CreateExpenseRequest,
  UpdateExpenseRequest,
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

export const expensesApi = {
  list: (eventId: string) =>
    fetchJson<{ expenses: Expense[] }>(`/api/live-events/${eventId}/expenses`).then(
      (r) => r.expenses
    ),

  create: (eventId: string, data: CreateExpenseRequest) =>
    fetchJson<Expense>(`/api/live-events/${eventId}/expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (eventId: string, expenseId: string, data: UpdateExpenseRequest) =>
    fetchJson<Expense>(`/api/live-events/${eventId}/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (eventId: string, expenseId: string) =>
    fetchJson<void>(`/api/live-events/${eventId}/expenses/${expenseId}`, {
      method: "DELETE",
    }),

  summary: (eventId: string) =>
    fetchJson<ExpenseSummary>(`/api/live-events/${eventId}/expenses/summary`),
};
