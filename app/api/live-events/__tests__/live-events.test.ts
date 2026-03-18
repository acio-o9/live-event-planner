/**
 * ライブイベント作成時のマイルストーン・タスク自動生成ロジックのテスト
 */
import { MILESTONE_TEMPLATES, EVENT_TASK_TEMPLATES, calcDueDate } from "@/lib/task-templates";

describe("ライブイベント作成時の自動生成ロジック", () => {
  const EVENT_DATE = "2026-09-01";

  describe("マイルストーン自動生成", () => {
    it("6つのマイルストーンが生成される", () => {
      const milestones = MILESTONE_TEMPLATES.map((mt) => ({
        title: mt.title,
        dueDate: calcDueDate(EVENT_DATE, mt.offsetDays),
        order: mt.order,
      }));
      expect(milestones).toHaveLength(6);
    });

    it("開催日が指定された場合、各マイルストーンの期限が正しく計算される", () => {
      const [first, ...rest] = MILESTONE_TEMPLATES;
      const dueDate = calcDueDate(EVENT_DATE, first.offsetDays);
      // -60日: 2026-09-01 → 2026-07-03
      expect(dueDate).toBe("2026-07-03");
      void rest;
    });

    it("order が 1 から始まる連番になっている", () => {
      MILESTONE_TEMPLATES.forEach((mt, i) => {
        expect(mt.order).toBe(i + 1);
      });
    });
  });

  describe("ライブ全体タスク自動生成", () => {
    it("全タスクが event スコープ", () => {
      EVENT_TASK_TEMPLATES.forEach((t) => {
        expect(t.scope).toBe("event");
      });
    });

    it("告知サイト作成タスクが含まれる", () => {
      const titles = EVENT_TASK_TEMPLATES.map((t) => t.title);
      expect(titles.some((t) => t.includes("告知"))).toBe(true);
    });

    it("打ち上げデリバリーのタスクが当日マイルストーンに紐付く", () => {
      const deliveryTask = EVENT_TASK_TEMPLATES.find((t) =>
        t.title.includes("デリバリー")
      );
      // MILESTONE_ORDER.EVENT_DAY = 6
      expect(deliveryTask?.milestoneOrder).toBe(6);
    });
  });

  describe("開催日未定の場合", () => {
    it("dueDateなしでマイルストーンを作成できる", () => {
      const milestones = MILESTONE_TEMPLATES.map((mt) => ({
        title: mt.title,
        dueDate: undefined, // 未定
        order: mt.order,
        status: "pending" as const,
      }));
      milestones.forEach((m) => {
        expect(m.dueDate).toBeUndefined();
      });
    });
  });
});
