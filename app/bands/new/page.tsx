"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BandForm } from "@/components/bands/BandForm";
import { useBands } from "@/hooks/useBands";

function NewBandPage() {
  const router = useRouter();
  const { create } = useBands();

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    const band = await create(data);
    router.push(`/bands/${band.id}`);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">バンドを作成</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <BandForm
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
      <NewBandPage />
    </AuthGuard>
  );
}
