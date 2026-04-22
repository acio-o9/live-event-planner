"use client";

import { useState } from "react";
import { CreateExpenseRequest, Expense } from "@/lib/types";

const CATEGORIES = ["会場費", "機材費", "飲食費", "交通費", "その他"];

interface Props {
  participants: { userId: string; nickname: string }[];
  initialData?: Expense;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  onCancel?: () => void;
}

export function ExpenseForm({ participants, initialData, onSubmit, onCancel }: Props) {
  const [paidBy, setPaidBy] = useState(initialData?.paidBy ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "その他");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!paidBy) errs.paidBy = "立替者を選択してください";
    const parsed = parseInt(amount, 10);
    if (!amount || isNaN(parsed) || parsed <= 0)
      errs.amount = "正の整数を入力してください";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      await onSubmit({
        paidBy,
        amount: parseInt(amount, 10),
        category,
        description: description.trim(),
      });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "保存に失敗しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          立替者 <span className="text-red-500">*</span>
        </label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {participants.map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.nickname}
            </option>
          ))}
        </select>
        {errors.paidBy && <p className="text-red-500 text-xs mt-1">{errors.paidBy}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          金額（円） <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 5000"
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: スタジオ代"
        />
      </div>

      {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "保存中..." : initialData ? "更新" : "登録"}
        </button>
      </div>
    </form>
  );
}
