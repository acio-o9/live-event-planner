import type { BandSchedule, CreateBandScheduleRequest } from "@/lib/types";

export const schedulesApi = {
  async list(from: string, to: string): Promise<BandSchedule[]> {
    const res = await fetch(`/api/schedules?from=${from}&to=${to}`);
    if (!res.ok) throw new Error("Failed to fetch schedules");
    const data = await res.json();
    return data.schedules;
  },

  async create(body: CreateBandScheduleRequest): Promise<BandSchedule> {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to create schedule");
    }
    return res.json();
  },

  async remove(scheduleId: string): Promise<void> {
    const res = await fetch(`/api/schedules/${scheduleId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to delete schedule");
    }
  },
};
