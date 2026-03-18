"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MemberList } from "@/components/bands/MemberList";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { bandsApi } from "@/lib/api/bands";
import { Band } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

function BandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [band, setBand] = useState<Band | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addSubInput, setAddSubInput] = useState("");

  useEffect(() => {
    bandsApi
      .get(id)
      .then(setBand)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRemoveMember = async (userSub: string) => {
    const updated = await bandsApi.removeMember(id, userSub);
    setBand(updated);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSubInput.trim()) return;
    const updated = await bandsApi.addMember(id, {
      userSub: addSubInput.trim(),
      role: "member",
    });
    setBand(updated);
    setAddSubInput("");
  };

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (error || !band) return <p className="text-red-500">{error ?? "Not found"}</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-1"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{band.name}</h1>
        {band.description && (
          <p className="text-gray-500 text-sm mt-1">{band.description}</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">メンバー</h2>
        <MemberList
          band={band}
          currentUserSub={user?.sub ?? ""}
          onRemove={handleRemoveMember}
        />

        <form onSubmit={handleAddMember} className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <input
            type="text"
            value={addSubInput}
            onChange={(e) => setAddSubInput(e.target.value)}
            placeholder="ユーザーのsub ID"
            className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200"
          >
            追加
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <BandDetailPage />
    </AuthGuard>
  );
}
