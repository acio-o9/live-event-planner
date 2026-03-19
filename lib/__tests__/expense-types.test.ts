import { Expense, ExpenseFormData, ExpenseSummary } from "../types";

describe("Expense 型定義", () => {
  describe("Expense", () => {
    it("必須フィールドで作成できる", () => {
      const expense: Expense = {
        id: "expense-1",
        liveEventId: "event-1",
        paidBy: "user-sub-1",
        paidByName: "taro",
        amount: 5000,
        category: "会場費",
        description: "スタジオ代",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(expense.id).toBe("expense-1");
      expect(expense.amount).toBe(5000);
    });

    it("amount は number 型（円単位の整数を想定）", () => {
      const expense: Expense = {
        id: "expense-2",
        liveEventId: "event-1",
        paidBy: "user-sub-1",
        paidByName: "taro",
        amount: 1500,
        category: "飲食費",
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(typeof expense.amount).toBe("number");
    });
  });

  describe("ExpenseFormData", () => {
    it("フォーム送信に必要なフィールドを持つ", () => {
      const formData: ExpenseFormData = {
        paidBy: "user-sub-1",
        amount: 3000,
        category: "機材費",
        description: "マイク代",
      };
      expect(formData.paidBy).toBeDefined();
      expect(formData.amount).toBeGreaterThan(0);
    });
  });

  describe("ExpenseSummary", () => {
    it("サマリーに必要なフィールドを持つ", () => {
      const summary: ExpenseSummary = {
        totalAmount: 15000,
        participantCount: 3,
        perPersonAmount: 5000,
        breakdown: [
          { userSub: "sub-1", nickname: "taro", paidAmount: 15000, balance: 10000 },
          { userSub: "sub-2", nickname: "jiro", paidAmount: 0, balance: -5000 },
          { userSub: "sub-3", nickname: "saburo", paidAmount: 0, balance: -5000 },
        ],
      };
      expect(summary.totalAmount).toBe(15000);
      expect(summary.breakdown).toHaveLength(3);
    });

    it("breakdown の balance の合計は 0 になる（均等割りの場合）", () => {
      const summary: ExpenseSummary = {
        totalAmount: 9000,
        participantCount: 3,
        perPersonAmount: 3000,
        breakdown: [
          { userSub: "sub-1", nickname: "taro", paidAmount: 9000, balance: 6000 },
          { userSub: "sub-2", nickname: "jiro", paidAmount: 0, balance: -3000 },
          { userSub: "sub-3", nickname: "saburo", paidAmount: 0, balance: -3000 },
        ],
      };
      const totalBalance = summary.breakdown.reduce((sum, b) => sum + b.balance, 0);
      expect(totalBalance).toBe(0);
    });
  });
});
