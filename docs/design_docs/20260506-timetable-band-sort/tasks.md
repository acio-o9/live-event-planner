# Tasks: Timetable Band Sort

**Status**: Not Started
**Created**: 2026-05-06
**Progress**: 0/22 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `prisma/schema.prisma`: `EventBand` モデルに `order Int @default(0)` を追加
- [ ] Docker内で `npx prisma migrate dev --name add-event-band-order` を実行
- [ ] `lib/types.ts`: `EventBand` インターフェースに `order: number` を追加
- [ ] `lib/types.ts`: `ReorderBandsRequest` インターフェースを追加 (`orderedIds: string[]`)

### Phase 2: API Service Layer

- [ ] `app/api/live-events/[id]/bands/reorder/route.ts` を新規作成
  - PATCH メソッドで `canManageEvent` チェック
  - `orderedIds` を受け取り、各バンドの `order` を更新
  - 更新後のバンド一覧を `order asc` でレスポンス
- [ ] `app/api/live-events/[id]/bands/route.ts`: GET時のソートを `order asc, createdAt asc` に変更
- [ ] `lib/api/live-events.ts`（またはAPIクライアント）: `reorderBands` メソッドを追加

### Phase 3: Custom Hooks

- [ ] `hooks/useBandReorder.ts` を新規作成
  - `bands` の楽観的ローカル状態管理
  - `onDragEnd` ハンドラ（順序更新 → API呼び出し）
  - API失敗時のロールバック処理

### Phase 4: UI Components

- [ ] `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` をインストール
- [ ] `components/live-events/SortableBandItem.tsx` を新規作成
  - `useSortable` フック使用
  - `canReorder=true` 時のみドラッグハンドル（GripVertical）表示
- [ ] `components/live-events/BandList.tsx` を新規作成
  - `app/live-events/[id]/page.tsx` の lines 149-190 相当を切り出し
  - `canReorder` props に応じて `DndContext + SortableContext` または通常リストを切り替え
  - `useBandReorder` フックを使用
- [ ] `app/live-events/[id]/page.tsx`: バンド一覧部分を `BandList` コンポーネントに置き換え
- [ ] `components/timeline/TimelineView.tsx`: バンド表示順が `order` を尊重していることを確認・修正

### Phase 5: Permission Control

- [ ] `lib/permissions.ts`: `canReorderBands` 関数を追加（`canManageEvent` を委譲）
- [ ] `app/api/live-events/[id]/bands/reorder/route.ts` で権限チェックが正しく動作することを確認
- [ ] `BandList` に渡す `canReorder` props が正しく計算されていることを確認（page.tsx側）

### Phase 6: Testing

- [ ] `lib/__tests__/permissions.test.ts`: `canReorderBands` の権限テストを追加
- [ ] `app/api/live-events/[id]/bands/reorder/route.test.ts` を新規作成
  - 正常系（admin・honki_kanrinin）: order が更新されること
  - 権限エラー（user）: 403 が返ること
  - バリデーションエラー: 400 が返ること
- [ ] `GET /api/live-events/[id]/bands` のレスポンスが `order asc` でソートされることをテスト

### Phase 7: Documentation & Review

- [ ] 動作確認: バンド一覧でドラッグ&ドロップ → タイムテーブルに順序が反映されること
- [ ] モバイル動作確認: タッチ長押しドラッグが機能すること
- [ ] コードレビューと最終確認

## Progress Tracking

**Overall**: 0% (0/22 tasks)

- Phase 1 (Types & Interfaces): 0% (0/4)
- Phase 2 (API Service): 0% (0/3)
- Phase 3 (Custom Hooks): 0% (0/1)
- Phase 4 (UI Components): 0% (0/5)
- Phase 5 (Permission Control): 0% (0/3)
- Phase 6 (Testing): 0% (0/3)
- Phase 7 (Documentation): 0% (0/3)

## Development Log

### Session 1: 2026-05-06
**Goal**: Phase 1〜2の実装（Schema変更・API追加）

**AI Tool**: Claude Code

**Tasks Completed**:
- [ ] Prisma schema 変更 + migration
- [ ] Types 更新
- [ ] PATCH /reorder API 実装

**Next Session**:
- [ ] Hooks・Components実装（Phase 3〜4）

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions
- ドラッグ&ドロップライブラリは `@dnd-kit` を採用（React向け、モバイルタッチ対応、アクセシビリティ良好）
- `canReorderBands` は既存の `canManageEvent` を再利用（admin | honki_kanrinin）
- 楽観的UI更新でドラッグ操作の即時レスポンスを実現

### Lessons Learned
（実装後に記録）

### AI Time Savings
（実装後に記録）
