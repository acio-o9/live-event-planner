"use client";

import { useState, useEffect } from "react";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useExpenses, useExpenseSummary } from "@/hooks/useExpenses";
import { liveEventsApi } from "@/lib/api/live-events";
import { CreateExpenseRequest } from "@/lib/types";

interface ExpenseTabProps {
  liveEventId: string;
}

export function ExpenseTab({ liveEventId }: ExpenseTabProps) {
  const { expenses, isLoading, create, update, remove } = useExpenses(liveEventId);
  const { summary, isLoading: summaryLoading, reload: reloadSummary } = useExpenseSummary(liveEventId);
  const [participants, setParticipants] = useState<{ userId: string; nickname: string }[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    liveEventsApi.get(liveEventId).then((event) => {
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
  }, [liveEventId]);

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
      <div className="flex justify-end">
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
