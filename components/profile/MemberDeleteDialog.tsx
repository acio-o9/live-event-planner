"use client";

import { useState } from "react";
import type { User } from "@/lib/types";

interface Props {
  member: User;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function MemberDeleteDialog({ member, onClose, onDeleted }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${member.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      onDeleted(member.id);
      onClose();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">メンバーを削除</h2>
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium">{member.nickname}</span> を削除しますか？この操作は取り消せません。
        </p>
        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
    </div>
  );
}
