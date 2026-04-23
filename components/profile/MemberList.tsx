"use client";

import type { User } from "@/lib/types";

interface Props {
  members: User[];
  onEdit?: (member: User) => void;
  onDelete?: (member: User) => void;
}

export function MemberList({ members, onEdit, onDelete }: Props) {
  if (members.length === 0) {
    return <p className="text-gray-500 text-sm py-4">該当するメンバーがいません</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {members.map((member) => (
        <li key={member.sub} className="py-3 flex items-center gap-3">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt={member.nickname}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
              {member.nickname.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{member.nickname}</p>
            {member.instruments.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {member.instruments.map((inst) => (
                  <span
                    key={inst.id}
                    className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {inst.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(member)}
                  className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  編集
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(member)}
                  className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  削除
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
