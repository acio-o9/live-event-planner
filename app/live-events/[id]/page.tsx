"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MilestoneList } from "@/components/live-events/MilestoneList";
import { AddBandModal } from "@/components/live-events/AddBandModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { liveEventsApi } from "@/lib/api/live-events";
import { LiveEvent } from "@/lib/types";
import Link from "next/link";

function LiveEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddBand, setShowAddBand] = useState(false);

  useEffect(() => {
    liveEventsApi
      .get(id)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleMilestoneStatusChange = async (
    milestoneId: string,
    status: "pending" | "in_progress" | "completed"
  ) => {
    await liveEventsApi.updateMilestone(id, milestoneId, { status });
    setEvent((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((m) =>
              m.id === milestoneId ? { ...m, status } : m
            ),
          }
        : prev
    );
  };

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (error || !event) return <p className="text-red-500">{error ?? "Not found"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          {event.date && (
            <p className="text-gray-500 text-sm mt-1">
              📅 {new Date(event.date).toLocaleDateString("ja-JP")}
              {event.venue && ` ・ 📍 ${event.venue}`}
            </p>
          )}
          {event.photoAlbumUrl && (
            <a
              href={event.photoAlbumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              📷 フォトアルバム
            </a>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">参加バンド</h2>
          <button
            onClick={() => setShowAddBand(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + バンドを追加
          </button>
        </div>
        {event.bands.length === 0 ? (
          <p className="text-gray-400 text-sm">まだ参加バンドがいません</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {event.bands.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/live-events/${id}/setlist?band=${b.id}`}
                  className="text-sm bg-white border border-gray-200 rounded px-3 py-1 hover:shadow-sm"
                >
                  {b.band.name}
                  {b.snapshotTakenAt && (
                    <span className="ml-1 text-xs text-green-500">✓</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showAddBand && (
        <AddBandModal
          alreadyAddedBandIds={event.bands.map((b) => b.bandId)}
          onSubmit={async (bandId) => {
            const liveEventBand = await liveEventsApi.addBand(id, { bandId });
            setEvent((prev) =>
              prev ? { ...prev, bands: [...prev.bands, liveEventBand] } : prev
            );
          }}
          onClose={() => setShowAddBand(false)}
        />
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">費用管理</h2>
          <Link
            href={`/live-events/${id}/expenses`}
            className="text-sm text-blue-600 hover:underline"
          >
            費用を管理 →
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">マイルストーン</h2>
        <MilestoneList
          milestones={event.milestones}
          liveEventId={id}
          onMilestoneStatusChange={handleMilestoneStatusChange}
        />
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <LiveEventDetailPage />
    </AuthGuard>
  );
}
