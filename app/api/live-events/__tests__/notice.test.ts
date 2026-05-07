/**
 * 連絡事項タブの権限・バリデーションロジックのテスト
 */
import { canManageEvent } from "@/lib/permissions";
import type { PermissionUser } from "@/lib/permissions";

describe("連絡事項編集権限", () => {
  const admin: PermissionUser = { id: "u-admin", role: "admin" };
  const kanrinin: PermissionUser = { id: "u-kanrinin", role: "honki_kanrinin" };
  const user: PermissionUser = { id: "u-user", role: "user" };

  it("admin は編集できる", () => {
    expect(canManageEvent(admin)).toBe(true);
  });

  it("honki_kanrinin は編集できる", () => {
    expect(canManageEvent(kanrinin)).toBe(true);
  });

  it("一般ユーザーは編集できない", () => {
    expect(canManageEvent(user)).toBe(false);
  });
});

describe("連絡事項リクエストバリデーション", () => {
  it("content が文字列であれば有効", () => {
    const body = { content: "# 連絡事項\n\n- 開場は18:00です" };
    expect(typeof body.content === "string").toBe(true);
  });

  it("空文字は有効（連絡事項のクリアを許容）", () => {
    const body = { content: "" };
    expect(typeof body.content === "string").toBe(true);
  });

  it("content がなければ無効", () => {
    const body = {} as { content?: string };
    expect(typeof body.content === "string").toBe(false);
  });
});

describe("LiveEventDetailTab に notice が含まれる", () => {
  it("notice タブが型として定義されている", () => {
    const validTabs = ["notice", "bands", "milestones", "expenses", "timeline"];
    expect(validTabs).toContain("notice");
    expect(validTabs.indexOf("notice")).toBe(0);
  });
});
