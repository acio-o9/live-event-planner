"use client";

import { useState, useEffect, useCallback } from "react";
import { TimelineEvent, CreateTimelineEventRequest, UpdateTimelineEventRequest } from "@/lib/types";

interface TimelineBand {
  id: string;
  name: string;
}

const BASE = (liveEventId: string) => `/api/live-events/${liveEventId}/timeline`;

export function useTimelineEvents(liveEventId: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [bands, setBands] = useState<TimelineBand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(BASE(liveEventId));
      if (!res.ok) throw new Error("タイムラインの取得に失敗しました");
      const data = await res.json();
      setEvents(data.events);
      setBands(data.bands);
    } catch (e) {
      setError(e instanceof Error ? e.message : "タイムラインの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [liveEventId]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (req: CreateTimelineEventRequest): Promise<TimelineEvent> => {
    const res = await fetch(BASE(liveEventId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("イベントの作成に失敗しました");
    const event: TimelineEvent = await res.json();
    setEvents((prev) => [...prev, event]);
    return event;
  }, [liveEventId]);

  const update = useCallback(async (id: string, req: UpdateTimelineEventRequest): Promise<TimelineEvent> => {
    const res = await fetch(`${BASE(liveEventId)}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("イベントの更新に失敗しました");
    const event: TimelineEvent = await res.json();
    setEvents((prev) => prev.map((e) => (e.id === id ? event : e)));
    return event;
  }, [liveEventId]);

  const remove = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${BASE(liveEventId)}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("イベントの削除に失敗しました");
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, [liveEventId]);

  const bulkReplace = useCallback(async (reqs: CreateTimelineEventRequest[]): Promise<void> => {
    // 全削除 → 一括作成（叩きのタイムライン生成用）
    await Promise.all(events.map((e) => fetch(`${BASE(liveEventId)}/${e.id}`, { method: "DELETE" })));
    const created = await Promise.all(
      reqs.map(async (req) => {
        const res = await fetch(BASE(liveEventId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        if (!res.ok) throw new Error("イベントの作成に失敗しました");
        return res.json() as Promise<TimelineEvent>;
      })
    );
    setEvents(created);
  }, [liveEventId, events]);

  return { events, bands, isLoading, error, create, update, remove, bulkReplace, reload: load };
}
