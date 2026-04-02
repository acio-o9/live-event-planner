"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { InstrumentFilter } from "@/components/profile/InstrumentFilter";
import { MemberList } from "@/components/profile/MemberList";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { User, Instrument } from "@/lib/types";

function MembersPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

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

  const filtered = selectedInstrumentId
    ? members.filter((m) => m.instruments.some((i) => i.id === selectedInstrumentId))
    : members;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">メンバー一覧</h1>

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
          <MemberList members={filtered} />
        </>
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
