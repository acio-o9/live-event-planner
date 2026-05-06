"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableBandItem } from "@/components/live-events/SortableBandItem";
import { useBandReorder } from "@/hooks/useBandReorder";
import type { EventBand } from "@/lib/types";

interface BandListProps {
  liveEventId: string;
  initialBands: EventBand[];
  canReorder: boolean;
  onBandsChange?: (bands: EventBand[]) => void;
  onManageMembers: (band: EventBand) => void;
  onEdit: (band: { id: string; name: string; description?: string }) => void;
  onDelete: (bandId: string) => void;
}

export function BandList({
  liveEventId,
  initialBands,
  canReorder,
  onBandsChange,
  onManageMembers,
  onEdit,
  onDelete,
}: BandListProps) {
  const { bands, setBands, handleDragEnd, error } = useBandReorder(liveEventId, initialBands);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (bands.length === 0) {
    return <p className="text-gray-400 text-sm">まだ参加バンドがいません</p>;
  }

  if (!canReorder) {
    return (
      <ul className="space-y-2">
        {bands.map((b) => (
          <SortableBandItem
            key={b.id}
            band={b}
            liveEventId={liveEventId}
            canReorder={false}
            onManageMembers={onManageMembers}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          handleDragEnd(event);
          onBandsChange?.(bands);
        }}
      >
        <SortableContext items={bands.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {bands.map((b) => (
              <SortableBandItem
                key={b.id}
                band={b}
                liveEventId={liveEventId}
                canReorder={true}
                onManageMembers={onManageMembers}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
