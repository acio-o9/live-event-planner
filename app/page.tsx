"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiveEventList } from "@/components/live-events/LiveEventList";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

function Dashboard() {
  const { liveEvents, isLoading, error } = useLiveEvents();

  const upcoming = liveEvents
    .filter((e) => e.status !== "cancelled" && e.status !== "completed")
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <Link
          href="/live-events/new"
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ライブを作成
        </Link>
      </div>
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">直近のライブ</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <LiveEventList events={upcoming} />
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
