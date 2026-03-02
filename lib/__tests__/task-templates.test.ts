import {
  MILESTONE_TEMPLATES,
  EVENT_TASK_TEMPLATES,
  BAND_TASK_TEMPLATES,
  calcDueDate,
  MILESTONE_ORDER,
} from "../task-templates";

describe("task-templates", () => {
  describe("MILESTONE_TEMPLATES", () => {
    it("6つのマイルストーンが定義されている", () => {
      expect(MILESTONE_TEMPLATES).toHaveLength(6);
    });

    it("order が 1〜6 で連番になっている", () => {
      const orders = MILESTONE_TEMPLATES.map((m) => m.order);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("offsetDays が降順（当日に近づく順）になっている", () => {
      const offsets = MILESTONE_TEMPLATES.map((m) => m.offsetDays);
      for (let i = 1; i < offsets.length; i++) {
        expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
      }
    });

    it("最初のマイルストーンが -60日", () => {
      expect(MILESTONE_TEMPLATES[0].offsetDays).toBe(-60);
    });

    it("最後のマイルストーンが 0日", () => {
      expect(MILESTONE_TEMPLATES[MILESTONE_TEMPLATES.length - 1].offsetDays).toBe(0);
    });
  });

  describe("EVENT_TASK_TEMPLATES", () => {
    it("全て scope が event", () => {
      EVENT_TASK_TEMPLATES.forEach((t) => expect(t.scope).toBe("event"));
    });

    it("全て有効な milestoneOrder を持つ", () => {
      const validOrders = Object.values(MILESTONE_ORDER);
      EVENT_TASK_TEMPLATES.forEach((t) => {
        expect(validOrders).toContain(t.milestoneOrder);
      });
    });
  });

  describe("BAND_TASK_TEMPLATES", () => {
    it("全て scope が band", () => {
      BAND_TASK_TEMPLATES.forEach((t) => expect(t.scope).toBe("band"));
    });

    it("PA表提出が含まれている", () => {
      expect(BAND_TASK_TEMPLATES.some((t) => t.title.includes("PA"))).toBe(true);
    });
  });

  describe("calcDueDate", () => {
    it("開催日から指定日数を引いた日付を返す", () => {
      const result = calcDueDate("2026-06-01", -30);
      expect(result).toBe("2026-05-02");
    });

    it("0日オフセットは開催日当日を返す", () => {
      const result = calcDueDate("2026-06-01", 0);
      expect(result).toBe("2026-06-01");
    });

    it("月をまたぐ計算が正しい", () => {
      const result = calcDueDate("2026-03-10", -60);
      expect(result).toBe("2026-01-09");
    });
  });
});
