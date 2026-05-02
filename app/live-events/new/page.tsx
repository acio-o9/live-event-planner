"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiveEventForm } from "@/components/live-events/LiveEventForm";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function NewLiveEventPage() {
  const router = useRouter();
  const { create } = useLiveEvents();
  const { canManageEvent, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !canManageEvent) {
      router.replace("/live-events");
    }
  }, [isLoading, canManageEvent, router]);

  if (isLoading || !canManageEvent) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    const event = await create(data);
    router.push(`/live-events/${event.id}`);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ライブを作成</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <LiveEventForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <NewLiveEventPage />
    </AuthGuard>
  );
}
