# Tasks: Slack Login Allowlist

**Status**: Not Started
**Created**: 2026-03-31
**Progress**: 0/16 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/auth/slack-allowlist.ts` に `SlackMember` 型を定義する
- [ ] `SlackAllowlistConfig` 型を定義する

### Phase 2: API Service Layer

- [ ] `lib/auth/slack-allowlist.ts` を作成する
- [ ] Slack Web API (`users.list`) でメンバー一覧を取得する実装
- [ ] アクティブメンバー（`deleted: false`, `is_bot: false`）のメールアドレスを抽出する
- [ ] `isEmailAllowed(email)` 関数を実装する
- [ ] ローカル環境（`NODE_ENV=development`）では検証をスキップして全許可するロジックを実装
- [ ] Slack APIエラー時のエラーハンドリング（fail-safe: ログイン拒否）を実装

### Phase 3: Custom Hooks

（サーバーサイド処理のため不要）

### Phase 4: UI Components

- [ ] `app/auth/error/page.tsx` を作成する（アクセス拒否ページ）
- [ ] `AccessDenied` エラーの場合は「アクセスが許可されていません」メッセージを表示
- [ ] NextAuthの `authOptions.pages.error` に `'/auth/error'` を設定する

### Phase 5: Permission Control

（NextAuth認証レベルの制御のため権限制御不要）

### Phase 6: Testing

- [ ] `lib/auth/slack-allowlist.ts` のユニットテスト（Slack APIモック）
- [ ] `isEmailAllowed()` の許可・拒否・ローカル環境のテストケース
- [ ] NextAuth `signIn` コールバックの統合テスト
- [ ] テストカバレッジ80%以上を達成する

### Phase 7: Documentation & Review

- [ ] `.env.example` に `SLACK_BOT_TOKEN` を追加する
- [ ] コードレビューと最終確認

## Progress Tracking

**Overall**: 0% (0/16 tasks)

- Phase 1 (Types & Interfaces): 0% (0/2)
- Phase 2 (API Service): 0% (0/6)
- Phase 3 (Custom Hooks): N/A
- Phase 4 (UI Components): 0% (0/3)
- Phase 5 (Permission Control): N/A
- Phase 6 (Testing): 0% (0/4)
- Phase 7 (Documentation): 0% (0/2)

## Development Log

### Session 1: 2026-03-31
**Goal**: Phase 1〜2の実装（Types & Slack Service）

**AI Tool**: Claude Code

**Tasks Completed**:
（実装後に記録）

**Next Session**:
- [ ] UI Components実装
- [ ] Testing

---

## Blockers

### Active Blockers
- Slack Bot Tokenが必要（`users:read.email` スコープ）

### Resolved Blockers
（なし）

## Notes

### Key Decisions
- ローカル環境では検証をスキップする（NODE_ENV=development で判定）
- Slack API失敗時はfail-safe（ログイン拒否）とする
- APIエンドポイントは不要、NextAuth signInコールバック内で完結させる

### Lessons Learned
（実装後に記録）

### AI Time Savings
（実装後に記録）
