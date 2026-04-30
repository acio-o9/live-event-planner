# Tasks: Live Detail Tabs

**Status**: Not Started
**Created**: 2026-04-30
**Progress**: 0/14 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `LiveEventDetailTab` 型（`"bands" | "milestones" | "expenses"`）を `lib/types.ts` または `LiveEventDetailTabs.tsx` 内に定義する

### Phase 2: API Service Layer

変更なし。スキップ。

### Phase 3: Custom Hooks

- [ ] `app/live-events/[id]/page.tsx` 内で `useSearchParams` を使ったタブ状態管理ロジックを実装する（`tab` の取得・`handleTabChange` の定義）

### Phase 4: UI Components

- [ ] `components/live-events/LiveEventDetailTabs.tsx` を新規作成する（タブナビゲーションUI、Tailwind スタイル付き）
- [ ] `components/live-events/ExpenseTab.tsx` を新規作成する（`expenses/page.tsx` のコンテンツロジックをコンポーネント化、ページヘッダー除く）
- [ ] `app/live-events/[id]/page.tsx` を修正: タブ状態管理・`<LiveEventDetailTabs>` 配置・タブ別コンテンツ切り替えを実装する
- [ ] `app/live-events/[id]/page.tsx` から費用管理リンクセクションを削除し、`<ExpenseTab>` に置き換える
- [ ] `useSearchParams` のために `Page` コンポーネントを `<Suspense>` でラップする

### Phase 5: Permission Control

- [ ] `AuthGuard` が引き続き正常に機能することを確認する（変更なし、動作確認のみ）

### Phase 6: Testing

- [ ] `LiveEventDetailTabs` のユニットテストを書く（アクティブタブのスタイル・クリックイベント）
- [ ] `ExpenseTab` のユニットテストを書く（レンダリング・費用追加フロー）
- [ ] `page.tsx` の統合的なタブ切り替えテストを書く（URLパラメータ連動）

### Phase 7: Documentation & Review

- [ ] 動作確認: バンド一覧・マイルストーン・費用管理タブすべての機能が正常動作するか手動確認
- [ ] デグレ確認: バンド追加・編集・削除・マイルストーン更新・費用CRUD が壊れていないか確認
- [ ] コードレビューと最終クリーンアップ

## Progress Tracking

**Overall**: 0% (0/14 tasks)

- Phase 1 (Types & Interfaces): 0% (0/1)
- Phase 2 (API Service): スキップ
- Phase 3 (Custom Hooks): 0% (0/1)
- Phase 4 (UI Components): 0% (0/5)
- Phase 5 (Permission Control): 0% (0/1)
- Phase 6 (Testing): 0% (0/3)
- Phase 7 (Documentation): 0% (0/3)

## Development Log

### Session 1: 2026-04-30
**Goal**: Phase 1〜4 の実装（型定義・タブコンポーネント・ページ修正）

**AI Tool**: Claude Code

**Tasks Completed**:
- なし（設計書作成中）

**Next Session**:
- [ ] `LiveEventDetailTab` 型定義
- [ ] `LiveEventDetailTabs.tsx` 作成
- [ ] `ExpenseTab.tsx` 作成
- [ ] `page.tsx` 修正

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- **`expenses/page.tsx` は残す**: `/live-events/[id]/expenses` への直接アクセスは引き続き有効。タブ内でも同コンポーネント群を使うが、既存ページは削除しない。
- **URLパラメータで状態保持**: `router.push` + `useSearchParams` を採用。ブラウザ履歴に残りブックマーク・共有が可能。
- **Suspense ラッパー必須**: `useSearchParams` は Next.js 14 App Router では Suspense 境界内でしか使えないため、`Page` コンポーネントで `<Suspense>` を追加。

### Lessons Learned
（実装後に記録）

### AI Time Savings
（実装後に記録）
