import { ExpenseSummary } from "@/lib/types";

export interface ExpenseRecord {
  paidBy: string;
  paidByNickname: string;
  amount: number;
}

export interface Participant {
  userId: string;
  nickname: string;
}

/**
 * 費用サマリーを計算する純粋関数
 * - 一人当たり負担額 = 合計 ÷ 参加人数（端数切り上げ）
 * - 精算差額 = 立替金額 - 一人当たり負担額（正: 受け取り、負: 支払い）
 */
export function calcExpenseSummary(
  expenses: ExpenseRecord[],
  participants: Participant[]
): ExpenseSummary {
  const participantCount = participants.length || 1;
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonAmount = Math.ceil(totalAmount / participantCount);

  // 立替者ごとの集計
  const paidMap = new Map<string, number>();
  for (const expense of expenses) {
    paidMap.set(expense.paidBy, (paidMap.get(expense.paidBy) ?? 0) + expense.amount);
  }

  const breakdown = participants.map(({ userId, nickname }) => {
    const paidAmount = paidMap.get(userId) ?? 0;
    return {
      userId,
      nickname,
      paidAmount,
      balance: paidAmount - perPersonAmount,
    };
  });

  return { totalAmount, participantCount, perPersonAmount, breakdown };
}
