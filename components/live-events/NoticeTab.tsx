"use client";

import { useState } from "react";
import MarkdownIt from "markdown-it";
import { liveEventsApi } from "@/lib/api/live-events";

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

interface NoticeTabProps {
  liveEventId: string;
  initialContent: string | undefined;
  canEdit: boolean;
}

export function NoticeTab({ liveEventId, initialContent, canEdit }: NoticeTabProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleClick = () => {
    if (!canEdit || isEditing) return;
    setDraft(content);
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await liveEventsApi.updateNotice(liveEventId, { content: draft });
      setContent(draft);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      setSaveError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          className="w-full min-h-[300px] p-3 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="マークダウンで連絡事項を入力してください"
          autoFocus
        />
        {saveError && (
          <p className="text-sm text-red-500">{saveError}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        onClick={handleClick}
        className={`py-12 text-center text-gray-400 text-sm ${canEdit ? "cursor-pointer hover:bg-gray-50 rounded-md transition-colors" : ""}`}
      >
        {canEdit ? "クリックして連絡事項を入力" : "連絡事項はまだありません"}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`prose prose-sm max-w-none ${canEdit ? "cursor-pointer hover:ring-2 hover:ring-blue-200 rounded-md p-3 transition-all" : "p-3"}`}
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  );
}
