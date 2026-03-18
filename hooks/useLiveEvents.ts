"use client";

import { useState, useEffect, useCallback } from "react";
import { liveEventsApi } from "@/lib/api/live-events";
import {
  LiveEvent,
  CreateLiveEventRequest,
  UpdateLiveEventRequest,
  UpdateMilestoneRequest,
  AddLiveEventBandRequest,
} from "@/lib/types";

export function useLiveEvents() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLiveEvents(await liveEventsApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load live events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: CreateLiveEventRequest) => {
    const event = await liveEventsApi.create(data);
    setLiveEvents((prev) => [...prev, event]);
    return event;
  }, []);

  const update = useCallback(async (id: string, data: UpdateLiveEventRequest) => {
    const event = await liveEventsApi.update(id, data);
    setLiveEvents((prev) => prev.map((e) => (e.id === id ? event : e)));
    return event;
  }, []);

  const updateMilestone = useCallback(
    async (id: string, milestoneId: string, data: UpdateMilestoneRequest) => {
      const milestone = await liveEventsApi.updateMilestone(id, milestoneId, data);
      setLiveEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                milestones: e.milestones.map((m) =>
                  m.id === milestoneId ? milestone : m
                ),
              }
            : e
        )
      );
      return milestone;
    },
    []
  );

  const addBand = useCallback(async (id: string, data: AddLiveEventBandRequest) => {
    const liveEventBand = await liveEventsApi.addBand(id, data);
    setLiveEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, bands: [...e.bands, liveEventBand] } : e
      )
    );
    return liveEventBand;
  }, []);

  const removeBand = useCallback(async (id: string, liveEventBandId: string) => {
    await liveEventsApi.removeBand(id, liveEventBandId);
    setLiveEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, bands: e.bands.filter((b) => b.id !== liveEventBandId) }
          : e
      )
    );
  }, []);

  return {
    liveEvents,
    isLoading,
    error,
    create,
    update,
    updateMilestone,
    addBand,
    removeBand,
    reload: load,
  };
}
