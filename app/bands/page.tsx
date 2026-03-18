"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { BandList } from "@/components/bands/BandList";
import { useBands } from "@/hooks/useBands";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

function BandsPage() {
  const { bands, isLoading, error } = useBands();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">バンド一覧</h1>
        <Link
          href="/bands/new"
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          バンドを作成
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <BandList bands={bands} />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <BandsPage />
    </AuthGuard>
  );
}
