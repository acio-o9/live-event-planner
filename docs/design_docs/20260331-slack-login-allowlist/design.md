# Design: Slack Login Allowlist

**Status**: Draft
**Created**: 2026-03-31
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[ ] Components        [ ] Hooks/Utils           [x] API Services      [x] Types/Interfaces

NextAuthのsignInコールバックにSlackメールアドレス検証を追加する。
Slack APIは外部サービスなので、専用のサービスモジュールに分離する。

## Implementation（実装詳細）

### 1. Type Layer

**Interface Definition**:
```typescript
// lib/auth/slack-allowlist.ts

export interface SlackMember {
  id: string;
  email: string;
  is_bot: boolean;
  deleted: boolean;
}

export interface SlackAllowlistConfig {
  token: string;     // SLACK_BOT_TOKEN
  enabled: boolean;  // NODE_ENV !== 'development' の場合 true
}
```

### 2. API Service Layer（Slack Allowlist）

**Service**:
```typescript
// lib/auth/slack-allowlist.ts

/**
 * Slack APIからアクティブメンバーのメールアドレス一覧を取得する
 * ローカル環境（NODE_ENV=development）ではスキップして全許可を返す
 */
export async function fetchSlackAllowedEmails(): Promise<Set<string>> {
  if (process.env.NODE_ENV === 'development') {
    return new Set(['*']); // ローカル環境は全許可
  }

  const token = process.env.SLACK_BOT_TOKEN;
  // Slack Web API: users.list を呼び出し、メールアドレスを抽出
}

/**
 * メールアドレスがSlack許可リストに含まれるか検証する
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  const allowedEmails = await fetchSlackAllowedEmails();
  if (allowedEmails.has('*')) return true; // ローカル環境
  return allowedEmails.has(email.toLowerCase());
}
```

### 3. NextAuth Callback（signIn）

**変更ファイル**: `lib/auth.ts` または `app/api/auth/[...nextauth]/route.ts`

```typescript
callbacks: {
  async signIn({ user }) {
    if (!user.email) return false;
    const allowed = await isEmailAllowed(user.email);
    if (!allowed) return '/auth/error?error=AccessDenied';
    return true;
  },
}
```

### 4. Component Layer（アクセス拒否ページ）

**新規ファイル**: `app/auth/error/page.tsx`

```typescript
// NextAuthのエラーページ（authOptions.pages.error に設定）
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // error === 'AccessDenied' の場合は専用メッセージを表示
  // その他のエラーは汎用エラーメッセージを表示
}
```

## API Specification

APIエンドポイントなし（NextAuth内部処理のみ）。

外部API:
- **Slack Web API**: `https://slack.com/api/users.list`
  - Header: `Authorization: Bearer ${SLACK_BOT_TOKEN}`
  - Response: `{ members: [{ id, profile: { email }, is_bot, deleted }] }`

## Environment Variables

```
SLACK_BOT_TOKEN=xoxb-...   # Slack Bot Token（users:read.email スコープが必要）
```

## Testing Strategy

### Unit Tests

- [ ] `lib/auth/slack-allowlist.ts`: Slackメンバー取得のモックテスト
- [ ] `isEmailAllowed()`: 許可・拒否それぞれのケーステスト
- [ ] ローカル環境（NODE_ENV=development）では常にtrueを返すことの確認
- [ ] Slack API失敗時のエラーハンドリングテスト

### Test Coverage Target

- **Overall**: 80%以上
- **Critical paths（isEmailAllowed）**: 100%

## Error Handling

- Slack APIがタイムアウトまたはエラーの場合: ログイン拒否（fail-safe）
- `SLACK_BOT_TOKEN` が未設定の場合: 本番環境では起動時エラー

## Performance Considerations

- **Slack API呼び出し**: ログイン時に1回のみ実行
- **キャッシュ**: 必要に応じてメールアドレス一覧を短時間（例: 5分）キャッシュすることを検討
- **Target**: 検証処理1秒以内
