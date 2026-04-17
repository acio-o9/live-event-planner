"use client";

import type { BandSchedule } from "@/lib/types";
import { ScheduleItem } from "./ScheduleItem";

interface Props {
  date: Date;
  isCurrentMonth: boolean;
  schedules: BandSchedule[];
  userBandIds: string[];
  onClick: (date: Date) => void;
  onDelete: (id: string) => void;
}

export function CalendarCell({
  date,
  isCurrentMonth,
  schedules,
  userBandIds,
  onClick,
  onDelete,
}: Props) {
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const canClick = userBandIds.length > 0;

  return (
    <div
      className={`min-h-[80px] border border-gray-100 p-1 ${
        isCurrentMonth ? "bg-white" : "bg-gray-50"
      } ${canClick ? "cursor-pointer hover:bg-blue-50" : ""}`}
      onClick={() => canClick && onClick(date)}
    >
      <div
        className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
          isToday
            ? "bg-blue-600 text-white"
            : isCurrentMonth
            ? "text-gray-700"
            : "text-gray-400"
        }`}
      >
        {date.getDate()}
      </div>
      <div className="space-y-0.5">
        {schedules.map((s) => (
          <ScheduleItem
            key={s.id}
            schedule={s}
            canDelete={userBandIds.includes(s.eventBandId)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
