"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { InstrumentFilter } from "@/components/profile/InstrumentFilter";
import { MemberList } from "@/components/profile/MemberList";
import { MemberAddModal } from "@/components/profile/MemberAddModal";
import { MemberEditModal } from "@/components/profile/MemberEditModal";
import { MemberDeleteDialog } from "@/components/profile/MemberDeleteDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { User, Instrument, UserRole } from "@/lib/types";

function MembersPage() {
  const { isAdmin, canManageEvent } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [deletingMember, setDeletingMember] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, instrumentsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/instruments"),
        ]);
        if (!usersRes.ok) throw new Error("メンバー一覧の取得に失敗しました");
        if (!instrumentsRes.ok) throw new Error("楽器一覧の取得に失敗しました");

        const [users, instrumentList] = await Promise.all([
          usersRes.json() as Promise<User[]>,
          instrumentsRes.json() as Promise<Instrument[]>,
        ]);

        setMembers(users);
        setInstruments(instrumentList);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdded = (user: User) => {
    setMembers((prev) => [...prev, user].sort((a, b) => a.nickname.localeCompare(b.nickname, "ja")));
  };

  const handleUpdated = (updated: User) => {
    setMembers((prev) =>
      prev
        .map((m) => (m.id === updated.id ? updated : m))
        .sort((a, b) => a.nickname.localeCompare(b.nickname, "ja"))
    );
  };

  const handleDeleted = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRoleChange = async (member: User, role: UserRole) => {
    const res = await fetch(`/api/users/${member.id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return;
    const updated = await res.json() as User;
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const filtered = selectedInstrumentId
    ? members.filter((m) => m.instruments.some((i) => i.id === selectedInstrumentId))
    : members;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メンバー一覧</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          メンバーを追加
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <InstrumentFilter
            instruments={instruments}
            selected={selectedInstrumentId}
            onChange={setSelectedInstrumentId}
          />
          <MemberList
            members={filtered}
            canChangeRole={canManageEvent}
            isAdmin={isAdmin}
            onEdit={setEditingMember}
            onDelete={setDeletingMember}
            onRoleChange={handleRoleChange}
          />
        </>
      )}

      {showAddModal && (
        <MemberAddModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}
      {editingMember && (
        <MemberEditModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onUpdated={handleUpdated}
        />
      )}
      {deletingMember && (
        <MemberDeleteDialog
          member={deletingMember}
          onClose={() => setDeletingMember(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <MembersPage />
    </AuthGuard>
  );
}
