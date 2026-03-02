"use client";

import { useState, useEffect, useCallback } from "react";
import { setlistsApi } from "@/lib/api/setlists";
import { Setlist, SetlistSong } from "@/lib/types";

export function useSetlist(liveEventId: string, liveEventBandId: string) {
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSetlist(await setlistsApi.get(liveEventId, liveEventBandId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load setlist");
    } finally {
      setIsLoading(false);
    }
  }, [liveEventId, liveEventBandId]);

  useEffect(() => { load(); }, [load]);

  const updateSongs = useCallback(
    async (songs: SetlistSong[]) => {
      const updated = await setlistsApi.update(liveEventId, liveEventBandId, {
        songs,
      });
      setSetlist(updated);
      return updated;
    },
    [liveEventId, liveEventBandId]
  );

  return { setlist, isLoading, error, updateSongs, reload: load };
}
