"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SetlistEditor } from "@/components/bands/SetlistEditor";
import { useSetlist } from "@/hooks/useSetlist";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function SetlistPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const liveEventBandId = searchParams.get("band") ?? "";

  const { setlist, isLoading, error, updateSongs } = useSetlist(id, liveEventBandId);

  if (!liveEventBandId) {
    return <p className="text-red-500">バンドが指定されていません</p>;
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (error || !setlist) return <p className="text-red-500">{error ?? "Not found"}</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-1"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">セットリスト編集</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SetlistEditor songs={setlist.songs} onSave={updateSongs} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <SetlistPage />
    </AuthGuard>
  );
}
