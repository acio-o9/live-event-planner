"use client";

import { useState, useEffect } from "react";
import { EventBand, User } from "@/lib/types";
import { liveEventsApi } from "@/lib/api/live-events";

interface Props {
  liveEventId: string;
  band: EventBand;
  onUpdate: (updated: EventBand) => void;
  onClose: () => void;
}

export function BandMembersModal({ liveEventId, band, onUpdate, onClose }: Props) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveEventsApi.listUsers()
      .then(setAllUsers)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const memberSubs = new Set(band.members.map((m) => m.userSub));
  const addableUsers = allUsers.filter((u) => !memberSubs.has(u.sub));

  const handleAdd = async (userSub: string) => {
    setError(null);
    try {
      const updated = await liveEventsApi.addMember(liveEventId, band.id, { userSub, role: "member" });
      onUpdate(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "追加に失敗しました");
    }
  };

  const handleRemove = async (userSub: string) => {
    setError(null);
    try {
      const updated = await liveEventsApi.removeMember(liveEventId, band.id, userSub);
      onUpdate(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{band.name} のメンバー</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="p-4 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">現在のメンバー</h3>
            {band.members.length === 0 ? (
              <p className="text-sm text-gray-400">メンバーがいません</p>
            ) : (
              <ul className="space-y-1">
                {band.members.map((m) => (
                  <li key={m.userSub} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-800">
                      {m.user.nickname}
                      {m.role === "leader" && (
                        <span className="ml-1 text-xs text-blue-500">リーダー</span>
                      )}
                    </span>
                    {m.role !== "leader" && (
                      <button
                        onClick={() => handleRemove(m.userSub)}
                        className="text-xs text-gray-400 hover:text-red-600"
                      >
                        削除
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">メンバーを追加</h3>
            {isLoading ? (
              <p className="text-sm text-gray-400">読み込み中...</p>
            ) : addableUsers.length === 0 ? (
              <p className="text-sm text-gray-400">追加できるユーザーがいません</p>
            ) : (
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {addableUsers.map((u) => (
                  <li key={u.sub} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-800">{u.nickname}</span>
                    <button
                      onClick={() => handleAdd(u.sub)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      追加
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
