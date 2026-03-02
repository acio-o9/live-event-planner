"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiveEventList } from "@/components/live-events/LiveEventList";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

function LiveEventsPage() {
  const { liveEvents, isLoading, error } = useLiveEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ライブイベント一覧</h1>
        <Link
          href="/live-events/new"
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ライブを作成
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <LiveEventList events={liveEvents} />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <LiveEventsPage />
    </AuthGuard>
  );
}
