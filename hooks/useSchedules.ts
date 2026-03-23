import { useState, useEffect, useCallback } from "react";
import { schedulesApi } from "@/lib/api/schedules";
import type { BandSchedule, CreateBandScheduleRequest } from "@/lib/types";

export function useSchedules(from: string, to: string) {
  const [schedules, setSchedules] = useState<BandSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await schedulesApi.list(from, to);
      setSchedules(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { schedules, isLoading, error, reload };
}

export function useScheduleMutations(reload: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = useCallback(
    async (data: CreateBandScheduleRequest) => {
      setIsSubmitting(true);
      try {
        await schedulesApi.create(data);
        reload();
      } finally {
        setIsSubmitting(false);
      }
    },
    [reload]
  );

  const remove = useCallback(
    async (scheduleId: string) => {
      await schedulesApi.remove(scheduleId);
      reload();
    },
    [reload]
  );

  return { create, remove, isSubmitting };
}
