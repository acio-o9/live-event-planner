import { CalendarTabs } from "@/components/calendar/CalendarTabs";

export const metadata = { title: "カレンダー | Live Event Planner" };

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">カレンダー</h1>
      <CalendarTabs />
    </div>
  );
}
