"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ScheduleFormModal } from "@/components/calendar/ScheduleFormModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSchedules, useScheduleMutations } from "@/hooks/useSchedules";
import { useAuth } from "@/hooks/useAuth";
import { liveEventsApi } from "@/lib/api/live-events";
import type { EventBand } from "@/lib/types";

function CalendarPage() {
  const { user } = useAuth();
  const [userBands, setUserBands] = useState<EventBand[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const to = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;

  const { schedules, isLoading, error, reload } = useSchedules(from, to);
  const { create, remove } = useScheduleMutations(reload);

  useEffect(() => {
    if (!user) return;
    liveEventsApi.list().then((events) => {
      const bands: EventBand[] = [];
      const seen = new Set<string>();
      for (const event of events) {
        for (const band of event.bands) {
          if (!seen.has(band.id) && band.members.some((m) => m.userId === user.id)) {
            bands.push(band);
            seen.add(band.id);
          }
        }
      }
      setUserBands(bands);
    });
  }, [user]);

  const userBandIds = userBands.map((b) => b.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">カレンダー</h1>
      <CalendarView
        schedules={schedules}
        userBandIds={userBandIds}
        onDateClick={(date) => {
          if (userBandIds.length > 0) setSelectedDate(date);
        }}
        onDelete={remove}
      />
      {selectedDate && (
        <ScheduleFormModal
          date={selectedDate}
          userBands={userBands}
          onSubmit={create}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <CalendarPage />
    </AuthGuard>
  );
}
