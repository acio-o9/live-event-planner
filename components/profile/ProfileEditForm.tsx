"use client";

import { useState, useEffect } from "react";
import type { User, Instrument, ProfileUpdateFormData } from "@/lib/types";
import { InstrumentSelector } from "./InstrumentSelector";

// 全角換算文字数カウント（全角=1、半角=0.5）
function countWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    width += char.match(/[\u3000-\u9fff\uff01-\uff60\uffe0-\uffe6]/) ? 1 : 0.5;
  }
  return width;
}

function validateNickname(value: string): string | null {
  if (value.trim() === "") return "ニックネームは必須です";
  if (/[\r\n\t]/.test(value)) return "ニックネームに使用できない文字が含まれています";
  if (countWidth(value.trim()) > 10) return "ニックネームは全角10文字以内で入力してください";
  return null;
}

interface Props {
  profile: User;
  instruments: Instrument[];
  isSaving: boolean;
  saveError: string | null;
  onSave: (data: ProfileUpdateFormData) => void;
}

export function ProfileEditForm({ profile, instruments, isSaving, saveError, onSave }: Props) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    profile.instruments.map((i) => i.id)
  );
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  useEffect(() => {
    setNickname(profile.nickname);
    setSelectedIds(profile.instruments.map((i) => i.id));
  }, [profile]);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameError(validateNickname(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNickname(nickname);
    if (err) {
      setNicknameError(err);
      return;
    }
    onSave({ nickname: nickname.trim(), instrumentIds: selectedIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ニックネーム
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => handleNicknameChange(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            nicknameError ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="ニックネームを入力"
          disabled={isSaving}
        />
        {nicknameError && (
          <p className="mt-1 text-xs text-red-600">{nicknameError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          全角10文字以内
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          担当楽器
        </label>
        <InstrumentSelector
          instruments={instruments}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      </div>

      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}

      <button
        type="submit"
        disabled={isSaving || !!nicknameError}
        className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
