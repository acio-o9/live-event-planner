"use client";

import { useState } from "react";
import type { BandSchedule } from "@/lib/types";
import { buildCalendarDays, schedulesForDate } from "@/lib/calendar-utils";
import { CalendarCell } from "./CalendarCell";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface Props {
  schedules: BandSchedule[];
  userBandIds: string[];
  onDateClick: (date: Date) => void;
  onDelete: (id: string) => void;
}

export function CalendarView({ schedules, userBandIds, onDateClick, onDelete }: Props) {
  const now = new Date();
  const [activeTab, setActiveTab] = useState(0); // 0=当月, 1=翌月

  const year = now.getFullYear();
  const month = now.getMonth() + activeTab;
  const adjustedYear = month > 11 ? year + 1 : year;
  const adjustedMonth = month > 11 ? month - 12 : month;

  const days = buildCalendarDays(adjustedYear, adjustedMonth);

  const tabLabels = [
    `${now.getFullYear()}年${now.getMonth() + 1}月`,
    `${new Date(year, now.getMonth() + 1).getFullYear()}年${new Date(year, now.getMonth() + 1).getMonth() + 1}月`,
  ];

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {tabLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
              activeTab === i
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-xs font-medium text-center py-2 border-b border-r border-gray-200 ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
            }`}
          >
            {w}
          </div>
        ))}
        {days.map((date, idx) => (
          <div key={idx} className="border-b border-r border-gray-200">
            <CalendarCell
              date={date}
              isCurrentMonth={date.getMonth() === adjustedMonth}
              schedules={schedulesForDate(schedules, date)}
              userBandIds={userBandIds}
              onClick={onDateClick}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {userBandIds.length === 0 && (
        <p className="text-sm text-gray-400 mt-3 text-center">
          バンドに所属すると予定を登録できます
        </p>
      )}
    </div>
  );
}
