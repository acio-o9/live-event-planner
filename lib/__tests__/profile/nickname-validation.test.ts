/**
 * ニックネームバリデーション（全角換算文字数カウント）のテスト
 */

// 全角換算文字数カウント（全角=1、半角=0.5）
function countWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    width += char.match(/[\u3000-\u9fff\uff01-\uff60\uffe0-\uffe6]/) ? 1 : 0.5;
  }
  return width;
}

function validateNickname(value: string): string | null {
  if (value.trim() === "") return "ニックネームは必須です";
  if (/[\r\n\t]/.test(value)) return "ニックネームに使用できない文字が含まれています";
  if (countWidth(value.trim()) > 10) return "ニックネームは全角10文字以内で入力してください";
  return null;
}

describe("countWidth", () => {
  it("全角10文字はwidth=10", () => {
    expect(countWidth("あいうえおかきくけこ")).toBe(10);
  });

  it("半角20文字はwidth=10", () => {
    expect(countWidth("abcdefghijklmnopqrst")).toBe(10);
  });

  it("全角11文字はwidth=11", () => {
    expect(countWidth("あいうえおかきくけこさ")).toBe(11);
  });

  it("空文字はwidth=0", () => {
    expect(countWidth("")).toBe(0);
  });

  it("混在: 全角5文字+半角10文字=width10", () => {
    expect(countWidth("あいうえおabcdefghij")).toBe(10);
  });
});

describe("validateNickname", () => {
  it("空文字はエラー", () => {
    expect(validateNickname("")).toBe("ニックネームは必須です");
  });

  it("空白のみはエラー", () => {
    expect(validateNickname("   ")).toBe("ニックネームは必須です");
  });

  it("改行はエラー", () => {
    expect(validateNickname("test\nname")).toBe("ニックネームに使用できない文字が含まれています");
  });

  it("タブはエラー", () => {
    expect(validateNickname("test\tname")).toBe("ニックネームに使用できない文字が含まれています");
  });

  it("全角10文字はOK", () => {
    expect(validateNickname("あいうえおかきくけこ")).toBeNull();
  });

  it("全角11文字はエラー", () => {
    expect(validateNickname("あいうえおかきくけこさ")).toBe("ニックネームは全角10文字以内で入力してください");
  });

  it("半角20文字はOK（全角換算10文字）", () => {
    expect(validateNickname("abcdefghijklmnopqrst")).toBeNull();
  });

  it("半角21文字はエラー", () => {
    expect(validateNickname("abcdefghijklmnopqrstu")).toBe("ニックネームは全角10文字以内で入力してください");
  });

  it("前後の空白はトリム後に判定される", () => {
    // 前後空白を除いた結果が空でない場合はOK
    expect(validateNickname("  テスト  ")).toBeNull();
  });
});
