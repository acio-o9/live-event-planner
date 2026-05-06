"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { liveEventsApi } from "@/lib/api/live-events";
import type { EventBand } from "@/lib/types";

export function useBandReorder(liveEventId: string, initialBands: EventBand[]) {
  const [bands, setBands] = useState<EventBand[]>(initialBands);
  const [error, setError] = useState<string | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = bands.findIndex((b) => b.id === active.id);
    const newIndex = bands.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(bands, oldIndex, newIndex);
    setBands(reordered);
    setError(null);

    liveEventsApi
      .reorderBands(liveEventId, { orderedIds: reordered.map((b) => b.id) })
      .then((updated) => setBands(updated))
      .catch(() => {
        setBands(bands);
        setError("並び替えの保存に失敗しました");
      });
  }

  return { bands, setBands, handleDragEnd, error };
}
