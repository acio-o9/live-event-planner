/**
 * バンド参加時のバンド個別タスク自動生成ロジックのテスト
 */
import { BAND_TASK_TEMPLATES, MILESTONE_ORDER } from "@/lib/task-templates";

describe("バンド参加時の個別タスク自動生成", () => {
  it("バンドタスクテンプレートが存在する", () => {
    expect(BAND_TASK_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("全タスクが band スコープ", () => {
    BAND_TASK_TEMPLATES.forEach((t) => {
      expect(t.scope).toBe("band");
    });
  });

  it("PA表提出タスクがセットリスト提出締め切りマイルストーンに紐付く", () => {
    const paTask = BAND_TASK_TEMPLATES.find((t) => t.title.includes("PA"));
    expect(paTask).toBeDefined();
    expect(paTask?.milestoneOrder).toBe(MILESTONE_ORDER.SETLIST_SUBMISSION);
  });

  it("セットリスト最終確認タスクが最終リハーサルマイルストーンに紐付く", () => {
    const checkTask = BAND_TASK_TEMPLATES.find((t) =>
      t.title.includes("セットリスト最終確認")
    );
    expect(checkTask).toBeDefined();
    expect(checkTask?.milestoneOrder).toBe(MILESTONE_ORDER.FINAL_REHEARSAL);
  });

  describe("バンドタスクのマイルストーン紐付けロジック", () => {
    const mockMilestones = [
      { id: "ms-1", order: MILESTONE_ORDER.BAND_APPLICATION },
      { id: "ms-2", order: MILESTONE_ORDER.SETLIST_SUBMISSION },
      { id: "ms-3", order: MILESTONE_ORDER.REHEARSAL_SCHEDULE },
      { id: "ms-4", order: MILESTONE_ORDER.VENUE_CHECK },
      { id: "ms-5", order: MILESTONE_ORDER.FINAL_REHEARSAL },
      { id: "ms-6", order: MILESTONE_ORDER.EVENT_DAY },
    ];

    it("テンプレートの milestoneOrder から正しいマイルストーンIDに解決できる", () => {
      BAND_TASK_TEMPLATES.forEach((tt) => {
        const milestone = mockMilestones.find((m) => m.order === tt.milestoneOrder);
        expect(milestone).toBeDefined();
      });
    });

    it("バンドタスクが生成されるマイルストーン数は全マイルストーン数以下", () => {
      const targetOrders = new Set(BAND_TASK_TEMPLATES.map((t) => t.milestoneOrder));
      expect(targetOrders.size).toBeLessThanOrEqual(mockMilestones.length);
    });
  });
});
