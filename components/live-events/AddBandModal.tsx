"use client";

import { useState, useEffect } from "react";
import { Band } from "@/lib/types";
import { bandsApi } from "@/lib/api/bands";

interface Props {
  alreadyAddedBandIds: string[];
  onSubmit: (bandId: string) => Promise<void>;
  onClose: () => void;
}

export function AddBandModal({ alreadyAddedBandIds, onSubmit, onClose }: Props) {
  const [bands, setBands] = useState<Band[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bandsApi.list()
      .then(setBands)
      .finally(() => setIsLoading(false));
  }, []);

  const availableBands = bands.filter((b) => !alreadyAddedBandIds.includes(b.id));

  const handleAdd = async (bandId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(bandId);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">バンドを追加</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">読み込み中...</p>
          ) : availableBands.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">追加できるバンドがありません</p>
          ) : (
            <ul className="space-y-2">
              {availableBands.map((band) => (
                <li key={band.id}>
                  <button
                    onClick={() => handleAdd(band.id)}
                    disabled={isSubmitting}
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-sm disabled:opacity-50"
                  >
                    <span className="font-medium">{band.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">{band.members.length}人</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
