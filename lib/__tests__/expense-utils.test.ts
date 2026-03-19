import { calcExpenseSummary } from "../expense-utils";

const PARTICIPANTS = [
  { userSub: "sub-1", nickname: "taro" },
  { userSub: "sub-2", nickname: "jiro" },
  { userSub: "sub-3", nickname: "saburo" },
];

describe("calcExpenseSummary", () => {
  describe("合計金額・一人当たり負担額", () => {
    it("費用がない場合は合計0・一人当たり0", () => {
      const result = calcExpenseSummary([], PARTICIPANTS);
      expect(result.totalAmount).toBe(0);
      expect(result.perPersonAmount).toBe(0);
    });

    it("合計金額が正しく計算される", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 5000 },
        { paidBy: "sub-2", paidByNickname: "jiro", amount: 3000 },
      ];
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      expect(result.totalAmount).toBe(8000);
    });

    it("一人当たり負担額 = 合計 ÷ 参加人数（端数切り上げ）", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 10000 },
      ];
      // 10000 ÷ 3 = 3333.33... → 切り上げ 3334
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      expect(result.perPersonAmount).toBe(3334);
    });

    it("割り切れる場合は端数なし", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 9000 },
      ];
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      expect(result.perPersonAmount).toBe(3000);
    });

    it("参加者数を正しく返す", () => {
      const result = calcExpenseSummary([], PARTICIPANTS);
      expect(result.participantCount).toBe(3);
    });

    it("参加者がいない場合は1人として計算（ゼロ除算回避）", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 3000 },
      ];
      const result = calcExpenseSummary(expenses, []);
      expect(result.participantCount).toBe(1);
      expect(result.perPersonAmount).toBe(3000);
    });
  });

  describe("精算差額（breakdown）", () => {
    it("立替者の balance は正（受け取り）", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 9000 },
      ];
      // 一人当たり 3000円、taro は 9000円立替 → balance = 9000 - 3000 = +6000
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      const taro = result.breakdown.find((b) => b.userSub === "sub-1");
      expect(taro?.balance).toBe(6000);
    });

    it("立て替えていない参加者の balance は負（支払い）", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 9000 },
      ];
      // saburo は0円立替 → balance = 0 - 3000 = -3000
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      const saburo = result.breakdown.find((b) => b.userSub === "sub-3");
      expect(saburo?.balance).toBe(-3000);
    });

    it("複数費用を立て替えた場合は合算される", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 3000 },
        { paidBy: "sub-1", paidByNickname: "taro", amount: 2000 },
      ];
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      const taro = result.breakdown.find((b) => b.userSub === "sub-1");
      expect(taro?.paidAmount).toBe(5000);
    });

    it("breakdown に全参加者が含まれる", () => {
      const result = calcExpenseSummary([], PARTICIPANTS);
      expect(result.breakdown).toHaveLength(3);
      expect(result.breakdown.map((b) => b.userSub)).toEqual(
        expect.arrayContaining(["sub-1", "sub-2", "sub-3"])
      );
    });

    it("立て替えていない参加者の paidAmount は 0", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 9000 },
      ];
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      const jiro = result.breakdown.find((b) => b.userSub === "sub-2");
      expect(jiro?.paidAmount).toBe(0);
    });
  });

  describe("全員が均等に立て替えた場合", () => {
    it("全員の balance が 0", () => {
      const expenses = [
        { paidBy: "sub-1", paidByNickname: "taro", amount: 3000 },
        { paidBy: "sub-2", paidByNickname: "jiro", amount: 3000 },
        { paidBy: "sub-3", paidByNickname: "saburo", amount: 3000 },
      ];
      const result = calcExpenseSummary(expenses, PARTICIPANTS);
      result.breakdown.forEach((b) => {
        expect(b.balance).toBe(0);
      });
    });
  });
});
