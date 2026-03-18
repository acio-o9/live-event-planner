"use client";

import { Band } from "@/lib/types";

interface Props {
  band: Band;
  currentUserSub: string;
  onRemove: (userSub: string) => Promise<void>;
}

export function MemberList({ band, currentUserSub, onRemove }: Props) {
  return (
    <ul className="divide-y divide-gray-100">
      {band.members.map((member) => (
        <li key={member.userSub} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {member.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.user.avatarUrl}
                alt={member.user.nickname}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {member.user.nickname[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{member.user.nickname}</p>
              <p className="text-xs text-gray-400">
                {member.role === "leader" ? "リーダー" : "メンバー"}
              </p>
            </div>
          </div>
          {currentUserSub !== member.userSub && (
            <button
              onClick={() => onRemove(member.userSub)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              削除
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
