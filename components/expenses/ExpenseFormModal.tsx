"use client";

import { ExpenseForm } from "./ExpenseForm";
import { CreateExpenseRequest, Expense } from "@/lib/types";

interface Props {
  participants: { userId: string; nickname: string }[];
  initialData?: Expense;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  onClose: () => void;
}

export function ExpenseFormModal({ participants, initialData, onSubmit, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "費用を編集" : "費用を登録"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <ExpenseForm
            participants={participants}
            initialData={initialData}
            onSubmit={async (data) => {
              await onSubmit(data);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
