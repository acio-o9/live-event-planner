"use client";

import { useState } from "react";
import { Expense, CreateExpenseRequest } from "@/lib/types";
import { ExpenseFormModal } from "./ExpenseFormModal";

interface Props {
  expenses: Expense[];
  participants: { userSub: string; nickname: string }[];
  onUpdate: (expenseId: string, data: CreateExpenseRequest) => Promise<void>;
  onDelete: (expenseId: string) => Promise<void>;
}

export function ExpenseList({ expenses, participants, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Expense | null>(null);

  if (expenses.length === 0) {
    return <p className="text-gray-400 text-sm">まだ費用が登録されていません</p>;
  }

  return (
    <>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-gray-500 text-left">
            <th className="py-2 pr-4">立替者</th>
            <th className="py-2 pr-4">金額</th>
            <th className="py-2 pr-4">カテゴリ</th>
            <th className="py-2 pr-4">メモ</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-b hover:bg-gray-50">
              <td className="py-2 pr-4">{e.paidByName}</td>
              <td className="py-2 pr-4 font-medium">¥{e.amount.toLocaleString()}</td>
              <td className="py-2 pr-4">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{e.category}</span>
              </td>
              <td className="py-2 pr-4 text-gray-500">{e.description}</td>
              <td className="py-2 flex gap-2">
                <button
                  onClick={() => setEditing(e)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={async () => {
                    if (confirm("この費用を削除しますか？")) await onDelete(e.id);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <ExpenseFormModal
          participants={participants}
          initialData={editing}
          onSubmit={(data) => onUpdate(editing.id, data)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
