interface SlackMember {
  id: string;
  deleted: boolean;
  is_bot: boolean;
  profile: {
    email?: string;
  };
}

interface SlackUsersListResponse {
  ok: boolean;
  members: SlackMember[];
  error?: string;
}

/**
 * Slack APIからアクティブメンバーのメールアドレス一覧を取得する。
 * ローカル環境（NODE_ENV=development）ではスキップして全許可を返す。
 */
export async function fetchSlackAllowedEmails(): Promise<Set<string>> {
  if (process.env.NODE_ENV === "development") {
    return new Set(["*"]);
  }

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN is not set");
  }

  const res = await fetch("https://slack.com/api/users.list", {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // 5分キャッシュ
  });

  if (!res.ok) {
    throw new Error(`Slack API request failed: ${res.status}`);
  }

  const data: SlackUsersListResponse = await res.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  const emails = new Set<string>();
  for (const member of data.members) {
    if (!member.deleted && !member.is_bot && member.profile.email) {
      emails.add(member.profile.email.toLowerCase());
    }
  }
  return emails;
}

/**
 * メールアドレスがSlack許可リストに含まれるか検証する。
 * エラー時はfail-safe（false を返してログイン拒否）。
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  try {
    const allowedEmails = await fetchSlackAllowedEmails();
    if (allowedEmails.has("*")) return true; // ローカル環境
    return allowedEmails.has(email.toLowerCase());
  } catch (err) {
    console.error("[slack-allowlist] Failed to fetch allowed emails:", err);
    return false; // fail-safe: ログイン拒否
  }
}
