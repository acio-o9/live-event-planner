"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useExpenses, useExpenseSummary } from "@/hooks/useExpenses";
import { liveEventsApi } from "@/lib/api/live-events";
import { CreateExpenseRequest } from "@/lib/types";

function ExpensesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { expenses, isLoading, create, update, remove } = useExpenses(id);
  const { summary, isLoading: summaryLoading, reload: reloadSummary } = useExpenseSummary(id);
  const [participants, setParticipants] = useState<{ userId: string; nickname: string }[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    liveEventsApi.get(id).then((event) => {
      const participantMap = new Map<string, string>();
      for (const band of event.bands) {
        if (band.memberSnapshot.length > 0) {
          for (const snap of band.memberSnapshot) {
            participantMap.set(snap.userId, snap.nickname);
          }
        } else {
          for (const member of band.members) {
            participantMap.set(member.userId, member.user.nickname);
          }
        }
      }
      setParticipants(
        Array.from(participantMap.entries()).map(([userId, nickname]) => ({ userId, nickname }))
      );
    });
  }, [id]);

  const handleCreate = async (data: CreateExpenseRequest) => {
    await create(data);
    await reloadSummary();
  };

  const handleUpdate = async (expenseId: string, data: CreateExpenseRequest) => {
    await update(expenseId, data);
    await reloadSummary();
  };

  const handleDelete = async (expenseId: string) => {
    await remove(expenseId);
    await reloadSummary();
  };

  if (isLoading || summaryLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">費用管理</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + 費用を追加
        </button>
      </div>

      {summary && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">サマリー</h2>
          <ExpenseSummary summary={summary} />
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">費用一覧</h2>
        <ExpenseList
          expenses={expenses}
          participants={participants}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>

      {showForm && (
        <ExpenseFormModal
          participants={participants}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <ExpensesPage />
    </AuthGuard>
  );
}
