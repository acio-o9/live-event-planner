import { LiveEvent } from "@/lib/types";
import { LiveEventCard } from "./LiveEventCard";

export function LiveEventList({ events }: { events: LiveEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        ライブイベントがまだありません
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <LiveEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
