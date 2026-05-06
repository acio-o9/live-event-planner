"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import type { EventBand } from "@/lib/types";

interface SortableBandItemProps {
  band: EventBand;
  liveEventId: string;
  canReorder: boolean;
  onManageMembers: (band: EventBand) => void;
  onEdit: (band: { id: string; name: string; description?: string }) => void;
  onDelete: (bandId: string) => void;
}

export function SortableBandItem({
  band,
  liveEventId,
  canReorder,
  onManageMembers,
  onEdit,
  onDelete,
}: SortableBandItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: band.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2"
    >
      {canReorder && (
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none px-1"
          aria-label="ドラッグして並び替え"
        >
          ⠿
        </span>
      )}
      <Link
        href={`/live-events/${liveEventId}/setlist?band=${band.id}`}
        className="text-sm font-medium text-gray-800 hover:text-blue-600 flex-1"
      >
        {band.name}
        {band.snapshotTakenAt && (
          <span className="ml-1 text-xs text-green-500">✓</span>
        )}
      </Link>
      {band.description && (
        <span className="text-xs text-gray-400 flex-1">{band.description}</span>
      )}
      <span className="text-xs text-gray-400">{band.members.length}人</span>
      {canReorder && (
        <>
          <button
            onClick={() => onManageMembers(band)}
            className="text-xs text-gray-400 hover:text-blue-600 px-1"
          >
            メンバー
          </button>
          <button
            onClick={() => onEdit({ id: band.id, name: band.name, description: band.description })}
            className="text-xs text-gray-400 hover:text-blue-600 px-1"
          >
            編集
          </button>
          <button
            onClick={() => onDelete(band.id)}
            className="text-xs text-gray-400 hover:text-red-600 px-1"
          >
            削除
          </button>
        </>
      )}
    </li>
  );
}
