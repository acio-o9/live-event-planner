"use client";

import { useState } from "react";
import { CalendarView } from "./CalendarView";
import { TimelineView } from "./TimelineView";

const TABS = [
  { id: "calendar", label: "月間カレンダー" },
  { id: "timeline", label: "タイムライン" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CalendarTabs() {
  const [active, setActive] = useState<TabId>("calendar");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "calendar" && <CalendarView />}
      {active === "timeline" && <TimelineView />}
    </div>
  );
}
