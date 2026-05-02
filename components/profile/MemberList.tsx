"use client";

import type { User, UserRole } from "@/lib/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "admin",
  honki_kanrinin: "本気管理人",
  user: "メンバー",
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700",
  honki_kanrinin: "bg-purple-100 text-purple-700",
  user: "bg-gray-100 text-gray-600",
};

interface Props {
  members: User[];
  canChangeRole?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onEdit?: (member: User) => void;
  onDelete?: (member: User) => void;
  onRoleChange?: (member: User, role: UserRole) => void;
}

export function MemberList({ members, canChangeRole, isAdmin, currentUserId, onEdit, onDelete, onRoleChange }: Props) {
  if (members.length === 0) {
    return <p className="text-gray-500 text-sm py-4">該当するメンバーがいません</p>;
  }

  const selectableRoles: UserRole[] = isAdmin
    ? ["admin", "honki_kanrinin", "user"]
    : ["honki_kanrinin", "user"];

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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">{member.nickname}</p>
              <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full shrink-0 ${ROLE_BADGE_CLASSES[member.role]}`}>
                {ROLE_LABELS[member.role]}
              </span>
            </div>
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
          <div className="flex items-center gap-2 shrink-0">
            {canChangeRole && onRoleChange && (
              <select
                value={member.role}
                onChange={(e) => onRoleChange(member, e.target.value as UserRole)}
                className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700"
              >
                {selectableRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            )}
            {(() => {
              const canEdit = onEdit && (isAdmin || member.id === currentUserId);
              const canDelete = onDelete && isAdmin;
              return (canEdit || canDelete) ? (
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => onEdit(member)}
                      className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      編集
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(member)}
                      className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      削除
                    </button>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        </li>
      ))}
    </ul>
  );
}
