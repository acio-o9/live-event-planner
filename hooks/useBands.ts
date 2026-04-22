"use client";

import { useState, useCallback } from "react";
import { bandsApi } from "@/lib/api/bands";
import { EventBand, CreateEventBandRequest, UpdateEventBandRequest, AddEventBandMemberRequest } from "@/lib/types";

export function useBands(liveEventId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateEventBandRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      return await bandsApi.create(liveEventId, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create band");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [liveEventId]);

  const update = useCallback(async (eventBandId: string, data: UpdateEventBandRequest): Promise<EventBand> => {
    return bandsApi.update(liveEventId, eventBandId, data);
  }, [liveEventId]);

  const remove = useCallback(async (eventBandId: string) => {
    await bandsApi.remove(liveEventId, eventBandId);
  }, [liveEventId]);

  const addMember = useCallback(async (eventBandId: string, data: AddEventBandMemberRequest): Promise<EventBand> => {
    return bandsApi.addMember(liveEventId, eventBandId, data);
  }, [liveEventId]);

  const removeMember = useCallback(async (eventBandId: string, userId: string): Promise<EventBand> => {
    return bandsApi.removeMember(liveEventId, eventBandId, userId);
  }, [liveEventId]);

  return { isLoading, error, create, update, remove, addMember, removeMember };
}
