"use client";

import type { BandSchedule } from "@/lib/types";
import { bandColor } from "@/lib/calendar-utils";

function bandTextColor(bandId: string): string {
  let hash = 0;
  for (let i = 0; i < bandId.length; i++) {
    hash = bandId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 30%)`;
}

interface Props {
  schedule: BandSchedule;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export function ScheduleItem({ schedule, canDelete, onDelete }: Props) {
  return (
    <div
      className="text-xs rounded px-1 py-0.5 flex items-center justify-between gap-1 min-w-0"
      style={{
        backgroundColor: bandColor(schedule.eventBandId),
        color: bandTextColor(schedule.eventBandId),
      }}
    >
      <span className="truncate">
        {schedule.bandName}・{schedule.location}
      </span>
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(schedule.id);
          }}
          className="flex-shrink-0 opacity-60 hover:opacity-100 leading-none"
          title="削除"
        >
          ×
        </button>
      )}
    </div>
  );
}
