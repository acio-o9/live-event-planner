import Link from "next/link";
import { LiveEvent } from "@/lib/types";

const STATUS_LABEL: Record<LiveEvent["status"], string> = {
  planning: "企画中",
  confirmed: "確定",
  completed: "完了",
  cancelled: "中止",
};

const STATUS_COLOR: Record<LiveEvent["status"], string> = {
  planning: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export function LiveEventCard({ event }: { event: LiveEvent }) {
  return (
    <Link
      href={`/live-events/${event.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{event.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLOR[event.status]}`}
        >
          {STATUS_LABEL[event.status]}
        </span>
      </div>
      {event.date && (
        <p className="text-sm text-gray-500 mt-1">
          📅 {new Date(event.date).toLocaleDateString("ja-JP")}
        </p>
      )}
      {event.venue && (
        <p className="text-sm text-gray-500">📍 {event.venue}</p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        参加バンド {event.bands.length}組
      </p>
    </Link>
  );
}
