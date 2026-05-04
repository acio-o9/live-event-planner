# Tasks: ライブタイムテーブル管理

**Status**: Not Started
**Created**: 2026-05-04
**Progress**: 0/26 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/types.ts` に `TLEventType`・`TimelineEvent`・`CreateTimelineEventRequest`・`UpdateTimelineEventRequest` を追加

### Phase 2: DB / Migration

- [ ] `prisma/schema.prisma` に `TimelineEvent` モデルを追加
- [ ] `LiveEvent` に `timelineEvents TimelineEvent[]` 逆リレーションを追加
- [ ] `EventBand` に `timelineEvents TimelineEvent[]` 逆リレーションを追加
- [ ] `prisma migrate dev` でマイグレーション実行
- [ ] `prisma generate` でクライアント再生成

### Phase 3: API Routes

- [ ] `app/api/live-events/[id]/timeline/route.ts` — GET（イベント一覧 + バンド一覧返却）
- [ ] `app/api/live-events/[id]/timeline/route.ts` — POST（新規作成、`canManageEvent` チェック）
- [ ] `app/api/live-events/[id]/timeline/[eventId]/route.ts` — PUT（更新、`canManageEvent` チェック）
- [ ] `app/api/live-events/[id]/timeline/[eventId]/route.ts` — DELETE（削除、`canManageEvent` チェック）

### Phase 4: Custom Hooks

- [ ] `hooks/useTimelineEvents.ts` — データ取得・`create`・`update`・`remove`・`bulkReplace` 実装
- [ ] ローディング・エラー状態の管理
- [ ] 楽観的更新（UI即時反映 + APIエラー時ロールバック）

### Phase 5: UI Components

- [ ] `components/timeline/TimelineEventModal.tsx` — モーダルを独立コンポーネントとして切り出し
- [ ] `components/timeline/TimelineView.tsx` — `liveEventId` prop 対応、`useTimelineEvents` に切り替え
- [ ] バンド列をハードコードの b1〜b8 から EventBand 動的生成に変更
- [ ] 叩きのタイムライン生成を `bulkReplace` API 経由に変更
- [ ] `app/live-events/[id]/timeline/page.tsx` — サーバーコンポーネントとして新規作成
- [ ] ライブイベント詳細ページのタブに「タイムライン」を追加
- [ ] レスポンシブ対応（768px〜、スマホ横スクロール）

### Phase 6: Permission Control

- [ ] 閲覧専用ユーザー向け: ドラッグ・クリック追加・編集ボタンを非表示
- [ ] `canManageEvent` に基づく UI 分岐を `TimelineView` に実装
- [ ] 異なるロールでの動作確認（admin / honki_kanrinin / user）

### Phase 7: Testing

- [ ] GET / POST / PUT / DELETE APIルートの動作確認
- [ ] 叩きのタイムライン生成〜DB保存〜再読み込みの E2E 動作確認
- [ ] ドラッグ移動後のDB反映確認
- [ ] 権限ロール別（閲覧のみ / 編集可）の表示差異確認

### Phase 8: Documentation & Review

- [ ] `docs/design_docs/20260504-live-timetable/` の Status を `Done` に更新
- [ ] コードレビューと動作確認

## Progress Tracking

**Overall**: 0% (0/26 tasks)

- Phase 1 (Types & Interfaces): 0% (0/1)
- Phase 2 (DB / Migration): 0% (0/5)
- Phase 3 (API Routes): 0% (0/4)
- Phase 4 (Custom Hooks): 0% (0/3)
- Phase 5 (UI Components): 0% (0/7)
- Phase 6 (Permission Control): 0% (0/3)
- Phase 7 (Testing): 0% (0/4)
- Phase 8 (Documentation): 0% (0/2)

## Development Log

### Session 1: 2026-05-04
**Goal**: 設計書作成

**Tasks Completed**:
- [x] requirements.md・design.md・tasks.md 作成

**Next Session**:
- [ ] Phase 1: 型定義追加
- [ ] Phase 2: Prisma スキーマ変更 + マイグレーション

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- `TimelineEvent.eventBandId` は nullable（null = スタッフ共通イベント）
- 既存 `canManageEvent()` を権限チェックに再利用
- 叩きのタイムライン生成は `bulkReplace`（全削除 + 一括挿入）で実装
- 既存の `components/calendar/TimelineView.tsx` は `components/timeline/TimelineView.tsx` に移動・更新

### Lessons Learned
（実装後に記録）
