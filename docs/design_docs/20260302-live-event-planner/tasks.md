# Tasks: Live Event Planner

**Status**: In Progress
**Created**: 2026-03-02
**Total Progress**: 95% (40/42 tasks completed)

## Phase 1: Types & Interfaces

- [x] `User` インターフェース定義（`lib/types.ts`）
- [x] `Band` / `BandMember` インターフェース定義
- [x] `LiveEvent` インターフェース定義
- [x] `LiveEventBand` / `MemberSnapshot` インターフェース定義
- [x] `Milestone` / `Task` インターフェース定義
- [x] `Setlist` / `SetlistSong` インターフェース定義
- [x] API リクエスト/レスポンス型定義
- [x] タスクテンプレート定数型定義（`TaskTemplate`）

## Phase 2: API Service Layer

- [x] OIDC認証設定（`lib/auth.ts`）
- [x] 認証APIルート実装（`/api/auth/[...nextauth]/route.ts`）
- [x] ユーザーAPIルート実装（`/api/users/me`）
- [x] バンドAPIルート実装（CRUD + メンバー管理）
- [x] ライブイベントAPIルート実装（CRUD）
- [x] マイルストーン・ライブ全体タスク自動生成ロジック実装（ライブ作成時）
- [x] LiveEventBand APIルート実装（参加追加・取り消し・スナップショット確定）
- [x] バンド個別タスク自動生成ロジック実装（バンド参加時）
- [x] タスクテンプレート定数実装（`lib/task-templates.ts`）
- [x] タスクAPIルート実装（CRUD + 担当者アサイン）
- [x] セットリストAPIルート実装
- [x] APIクライアント実装（`lib/api/`）

## Phase 3: Custom Hooks

- [x] `useAuth` フック（認証状態管理）
- [x] `useBands` フック（バンド一覧・操作）
- [x] `useLiveEvents` フック（ライブイベント一覧・操作）
- [x] `useTask` フック（タスク一覧・ステータス更新・担当者アサイン）
- [x] `useSetlist` フック（セットリスト編集）

## Phase 4: UI Components

- [x] `AuthGuard` コンポーネント実装
- [x] 共通UIコンポーネント（Header, Navigation, LoadingSpinner）
- [x] バンド関連コンポーネント（BandList, BandCard, BandForm, MemberList）
- [x] ライブイベント関連コンポーネント（LiveEventList, LiveEventCard, LiveEventForm）
- [x] マイルストーンコンポーネント（MilestoneList）
- [x] タスク関連コンポーネント（TaskList）
- [x] セットリストエディタ（SetlistEditor）
- [x] 全ページ実装（ダッシュボード、ライブ一覧/作成/詳細、バンド一覧/作成/詳細、セットリスト編集）

## Phase 5: Permission Control（基本）

- [x] `AuthGuard` による未認証リダイレクト実装
- [x] API Routes でのセッション確認ミドルウェア実装（`middleware.ts`）
- [x] 将来の権限拡張のための `Permission` 型定義（コメントとして記録）

## Phase 6: Testing

- [x] 型定義のテスト（`lib/__tests__/types.test.ts`）
- [x] APIサービスのユニットテスト（`lib/__tests__/task-templates.test.ts`, `store.test.ts`）
- [ ] コンポーネントのユニットテスト
- [ ] 認証フローの統合テスト

## Phase 7: Documentation & Review

- [x] README.md 更新（セットアップ手順）
- [x] 設計書（このファイル）の進捗率を最終更新

---

## Progress Tracking

| Phase | 進捗 |
|-------|------|
| Phase 1: Types & Interfaces | 8/8 ✅ |
| Phase 2: API Service Layer | 12/12 ✅ |
| Phase 3: Custom Hooks | 5/5 ✅ |
| Phase 4: UI Components | 8/8 ✅ |
| Phase 5: Permission Control | 3/3 ✅ |
| Phase 6: Testing | 2/4 |
| Phase 7: Documentation | 2/2 ✅ |
| **合計** | **40/42** |

## Development Log

### Session 1: 2026-03-02 17:00-22:59
**Goal**: 設計書の作成から Phase 1〜7 の全実装

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] .claude/commands のコマンド名修正（コロン→ハイフン）
- [x] 設計書作成（requirements.md / design.md / tasks.md）
- [x] ドメインモデル設計（User OIDC sub化、LiveEventBandスナップショット、Taskエンティティ）
- [x] Next.js 14 プロジェクトセットアップ
- [x] Phase 1-7 全実装（型定義・API・フック・UI・権限制御・テスト・ドキュメント）
- [x] TypeScript エラー 0 / テスト 39 件全通過

**Issues Encountered**:
- `create-next-app` が既存ファイルと競合 → 手動でプロジェクト構造を作成
- `crypto.randomUUID` が jsdom 未サポート → `jest.setup.ts` で webcrypto をポリフィル
- `next.config.ts` が Next.js 14 では非対応 → `next.config.js` に変換

**Next Session**:
- [ ] コンポーネントのユニットテスト実装
- [ ] 認証フローの統合テスト
- [ ] Google Cloud Console で OAuth クライアント設定 → 動作確認
- [ ] データベース（Prisma + PostgreSQL など）への移行

**Time**: 360 minutes
**Time Saved with AI**: 約 600 minutes（設計議論・実装・デバッグの自動化）

---

## Notes / Key Decisions

- **認証**: NextAuth.js v5 (Auth.js) を使用してGoogle OIDCを実装
- **権限制御**: Phase 1では認証ガードのみ実装。将来的にロールベースの権限制御を追加できる構造にする
- **マイルストーン**: ライブ作成時に開催日から逆算して6つのマイルストーンとライブ全体タスクを自動生成する
- **タスク**: `liveEventBandId` の有無でライブ全体タスク／バンド個別タスクを区別。担当者アサイン可能。テンプレートはコード定義（DBには持たない）
- **バンド個別タスク**: LiveEventBand作成時（バンド参加時）に自動生成する
- **データストア**: 現在はインメモリ（`lib/store.ts`）。本番環境ではDBに置き換え必要

## Blockers

- **DBなし**: 現在はインメモリストアのためサーバー再起動でデータが消える。Prisma + PostgreSQL などへの移行が必要
