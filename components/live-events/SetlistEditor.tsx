"use client";

import { useState } from "react";
import { SetlistSong } from "@/lib/types";

interface Props {
  songs: SetlistSong[];
  onSave: (songs: SetlistSong[]) => Promise<unknown>;
}

export function SetlistEditor({ songs: initialSongs, onSave }: Props) {
  const [songs, setSongs] = useState<SetlistSong[]>(initialSongs);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const addSong = () => {
    setSongs((prev) => [
      ...prev,
      { order: prev.length + 1, title: "" },
    ]);
  };

  const updateSong = (index: number, patch: Partial<SetlistSong>) => {
    setSongs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  };

  const removeSong = (index: number) => {
    setSongs((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const moveSong = (index: number, direction: "up" | "down") => {
    const next = [...songs];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSongs(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(songs);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {songs.map((song, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6 text-right">{index + 1}.</span>
            <input
              type="text"
              value={song.title}
              onChange={(e) => updateSong(index, { title: e.target.value })}
              placeholder="曲名"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={song.note ?? ""}
              onChange={(e) => updateSong(index, { note: e.target.value || undefined })}
              placeholder="備考"
              className="w-24 border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={() => moveSong(index, "up")} className="text-gray-400 hover:text-gray-600 text-xs">▲</button>
            <button onClick={() => moveSong(index, "down")} className="text-gray-400 hover:text-gray-600 text-xs">▼</button>
            <button onClick={() => removeSong(index)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3">
        <button
          onClick={addSong}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + 曲を追加
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-auto px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
        {savedMessage && (
          <span className="text-xs text-green-600">保存しました</span>
        )}
      </div>
    </div>
  );
}
