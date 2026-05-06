/**
 * バンド並び替えロジックのテスト
 */
import { canReorderBands } from "@/lib/permissions";
import type { PermissionUser } from "@/lib/permissions";

describe("バンド並び替え権限", () => {
  const admin: PermissionUser = { id: "u-admin", role: "admin" };
  const kanrinin: PermissionUser = { id: "u-kanrinin", role: "honki_kanrinin" };
  const user: PermissionUser = { id: "u-user", role: "user" };

  it("admin は並び替えできる", () => {
    expect(canReorderBands(admin)).toBe(true);
  });

  it("honki_kanrinin は並び替えできる", () => {
    expect(canReorderBands(kanrinin)).toBe(true);
  });

  it("一般ユーザーは並び替えできない", () => {
    expect(canReorderBands(user)).toBe(false);
  });
});

describe("orderedIds バリデーションロジック", () => {
  it("空配列は無効", () => {
    const orderedIds: string[] = [];
    expect(Array.isArray(orderedIds) && orderedIds.length > 0).toBe(false);
  });

  it("IDリストがあれば有効", () => {
    const orderedIds = ["id-1", "id-2", "id-3"];
    expect(Array.isArray(orderedIds) && orderedIds.length > 0).toBe(true);
  });

  it("配列でなければ無効", () => {
    const orderedIds = null;
    expect(Array.isArray(orderedIds) && (orderedIds as string[]).length > 0).toBe(false);
  });
});

describe("バンドソート順の計算", () => {
  it("orderedIds のインデックスがそのまま order 値になる", () => {
    const orderedIds = ["band-c", "band-a", "band-b"];
    const result = orderedIds.map((id, index) => ({ id, order: index }));
    expect(result).toEqual([
      { id: "band-c", order: 0 },
      { id: "band-a", order: 1 },
      { id: "band-b", order: 2 },
    ]);
  });
});
