# Tasks: Live Event Planner

**Status**: Draft
**Created**: 2026-03-02
**Total Progress**: 0% (0/28 tasks completed)

## Phase 1: Types & Interfaces

- [ ] `User` インターフェース定義（`src/lib/types.ts`）
- [ ] `Band` / `BandMember` インターフェース定義
- [ ] `LiveEvent` インターフェース定義
- [ ] `Milestone` インターフェース定義
- [ ] `Setlist` / `SetlistSong` インターフェース定義
- [ ] API リクエスト/レスポンス型定義

## Phase 2: API Service Layer

- [ ] OIDC認証設定（`src/lib/auth.ts`）
- [ ] 認証APIルート実装（`/api/auth/signin`, `/api/auth/callback`, `/api/auth/signout`）
- [ ] ユーザーAPIルート実装（`/api/users/me`）
- [ ] バンドAPIルート実装（CRUD + メンバー管理）
- [ ] ライブイベントAPIルート実装（CRUD）
- [ ] マイルストーン自動生成ロジック実装
- [ ] セットリストAPIルート実装
- [ ] APIクライアント実装（`src/lib/api/`）

## Phase 3: Custom Hooks

- [ ] `useAuth` フック（認証状態管理）
- [ ] `useBands` フック（バンド一覧・操作）
- [ ] `useLiveEvents` フック（ライブイベント一覧・操作）
- [ ] `useSetlist` フック（セットリスト編集）

## Phase 4: UI Components

- [ ] `AuthGuard` コンポーネント実装
- [ ] 共通UIコンポーネント（Header, Navigation, LoadingSpinner）
- [ ] バンド関連コンポーネント（BandList, BandCard, BandForm, MemberList）
- [ ] ライブイベント関連コンポーネント（LiveEventList, LiveEventCard, LiveEventForm）
- [ ] マイルストーンコンポーネント（MilestoneList）
- [ ] セットリストエディタ（SetlistEditor）
- [ ] 全ページ実装（ダッシュボード、ライブ一覧/作成/詳細、バンド一覧/作成/詳細、セットリスト編集）

## Phase 5: Permission Control（基本）

- [ ] `AuthGuard` による未認証リダイレクト実装
- [ ] API Routes でのセッション確認ミドルウェア実装
- [ ] 将来の権限拡張のための `Permission` 型定義（コメントとして記録）

## Phase 6: Testing

- [ ] 型定義のテスト
- [ ] APIサービスのユニットテスト（カバレッジ80%以上）
- [ ] コンポーネントのユニットテスト
- [ ] 認証フローの統合テスト

## Phase 7: Documentation & Review

- [ ] README.md 更新（セットアップ手順）
- [ ] 設計書（このファイル）の進捗率を最終更新

---

## Progress Tracking

| Phase | 進捗 |
|-------|------|
| Phase 1: Types & Interfaces | 0/6 |
| Phase 2: API Service Layer | 0/7 |
| Phase 3: Custom Hooks | 0/4 |
| Phase 4: UI Components | 0/7 |
| Phase 5: Permission Control | 0/3 |
| Phase 6: Testing | 0/4 |
| Phase 7: Documentation | 0/2 |
| **合計** | **0/33** |

## Development Log

<!-- 開発セッションのログをここに追記 -->

---

## Notes / Key Decisions

- **認証**: NextAuth.js (Auth.js) を使用してGoogle OIDCを実装する方向を想定
- **権限制御**: Phase 1では認証ガードのみ実装。将来的にロールベースの権限制御を追加できる構造にする
- **マイルストーン**: ライブ作成時に開催日から逆算して6つのマイルストーンを自動生成する

## Blockers

<!-- 発生した問題をここに記録 -->
