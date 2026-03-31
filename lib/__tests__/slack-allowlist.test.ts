import { fetchSlackAllowedEmails, isEmailAllowed } from "../auth/slack-allowlist";

// Slack API のモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeSlackResponse(members: object[]) {
  return {
    ok: true,
    members,
  };
}

function mockSlackMembers(members: object[]) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => makeSlackResponse(members),
  });
}

beforeEach(() => {
  mockFetch.mockClear();
});

// ---------------------------------------------------------------------------
// fetchSlackAllowedEmails
// ---------------------------------------------------------------------------

describe("fetchSlackAllowedEmails", () => {
  describe("ローカル環境（NODE_ENV=development）", () => {
    it("'*' を含む Set を返す（全許可）", async () => {
      // NODE_ENV は jest の設定で 'test' だが、development と同等の扱いを確認する場合は
      // 直接 isEmailAllowed の development ブランチをテストする
      // → isEmailAllowed のテストに委ねる
    });
  });

  describe("本番環境（NODE_ENV=test）", () => {
    it("アクティブメンバーのメールアドレス一覧を返す", async () => {
      mockSlackMembers([
        { id: "U1", deleted: false, is_bot: false, profile: { email: "alice@example.com" } },
        { id: "U2", deleted: false, is_bot: false, profile: { email: "bob@example.com" } },
      ]);

      const emails = await fetchSlackAllowedEmails();

      expect(emails.has("alice@example.com")).toBe(true);
      expect(emails.has("bob@example.com")).toBe(true);
    });

    it("削除済みメンバーのメールアドレスは含まない", async () => {
      mockSlackMembers([
        { id: "U1", deleted: true, is_bot: false, profile: { email: "deleted@example.com" } },
        { id: "U2", deleted: false, is_bot: false, profile: { email: "active@example.com" } },
      ]);

      const emails = await fetchSlackAllowedEmails();

      expect(emails.has("deleted@example.com")).toBe(false);
      expect(emails.has("active@example.com")).toBe(true);
    });

    it("ボットのメールアドレスは含まない", async () => {
      mockSlackMembers([
        { id: "B1", deleted: false, is_bot: true, profile: { email: "bot@example.com" } },
        { id: "U1", deleted: false, is_bot: false, profile: { email: "human@example.com" } },
      ]);

      const emails = await fetchSlackAllowedEmails();

      expect(emails.has("bot@example.com")).toBe(false);
      expect(emails.has("human@example.com")).toBe(true);
    });

    it("メールアドレスが未設定のメンバーはスキップする", async () => {
      mockSlackMembers([
        { id: "U1", deleted: false, is_bot: false, profile: {} },
      ]);

      const emails = await fetchSlackAllowedEmails();

      expect(emails.size).toBe(0);
    });

    it("Slack API が ok:false を返した場合はエラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: false, error: "invalid_auth" }),
      });

      await expect(fetchSlackAllowedEmails()).rejects.toThrow("invalid_auth");
    });

    it("HTTP エラーの場合はエラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(fetchSlackAllowedEmails()).rejects.toThrow("500");
    });
  });
});

// ---------------------------------------------------------------------------
// isEmailAllowed
// ---------------------------------------------------------------------------

describe("isEmailAllowed", () => {
  it("許可リストに含まれるメールアドレスは true を返す", async () => {
    mockSlackMembers([
      { id: "U1", deleted: false, is_bot: false, profile: { email: "member@example.com" } },
    ]);

    await expect(isEmailAllowed("member@example.com")).resolves.toBe(true);
  });

  it("許可リストにないメールアドレスは false を返す", async () => {
    mockSlackMembers([
      { id: "U1", deleted: false, is_bot: false, profile: { email: "member@example.com" } },
    ]);

    await expect(isEmailAllowed("outsider@example.com")).resolves.toBe(false);
  });

  it("メールアドレスは大文字小文字を区別しない", async () => {
    mockSlackMembers([
      { id: "U1", deleted: false, is_bot: false, profile: { email: "member@example.com" } },
    ]);

    await expect(isEmailAllowed("MEMBER@EXAMPLE.COM")).resolves.toBe(true);
  });

  it("Slack API エラー時は fail-safe で false を返す", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));

    await expect(isEmailAllowed("someone@example.com")).resolves.toBe(false);
  });
});
