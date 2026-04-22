"use client";

import { ExpenseSummary as Summary } from "@/lib/types";

interface Props {
  summary: Summary;
}

export function ExpenseSummary({ summary }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">合計金額</p>
          <p className="text-2xl font-bold text-blue-700">
            ¥{summary.totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">参加人数</p>
          <p className="text-2xl font-bold text-gray-700">{summary.participantCount}人</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">一人当たり</p>
          <p className="text-2xl font-bold text-green-700">
            ¥{summary.perPersonAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {summary.breakdown.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">精算表</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="py-2 pr-4">名前</th>
                <th className="py-2 pr-4 text-right">立替金額</th>
                <th className="py-2 text-right">精算差額</th>
              </tr>
            </thead>
            <tbody>
              {summary.breakdown.map((b) => (
                <tr key={b.userId} className="border-b">
                  <td className="py-2 pr-4">{b.nickname}</td>
                  <td className="py-2 pr-4 text-right">¥{b.paidAmount.toLocaleString()}</td>
                  <td
                    className={`py-2 text-right font-medium ${
                      b.balance > 0
                        ? "text-green-600"
                        : b.balance < 0
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {b.balance > 0
                      ? `+¥${b.balance.toLocaleString()} 受け取り`
                      : b.balance < 0
                      ? `-¥${Math.abs(b.balance).toLocaleString()} 支払い`
                      : "清算済み"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
