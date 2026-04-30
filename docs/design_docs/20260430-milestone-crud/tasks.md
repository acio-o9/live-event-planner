# Tasks: Milestone CRUD

**Status**: Not Started
**Created**: 2026-04-30
**Progress**: 0/18 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/types.ts` に `CreateMilestoneRequest` を追加

### Phase 2: API Service Layer

- [ ] `lib/api/live-events.ts` に `createMilestone` メソッド追加（POST）
- [ ] `lib/api/live-events.ts` に `deleteMilestone` メソッド追加（DELETE）

### Phase 3: API Routes（サーバー側）

- [ ] `app/api/live-events/[id]/milestones/route.ts` に POST ハンドラ追加
  - title / dueDate を受け取り、order = 既存件数+1 で作成
- [ ] `app/api/live-events/[id]/milestones/[milestoneId]/route.ts` に DELETE ハンドラ追加
  - milestoneId の存在確認・liveEventId 一致確認 → 削除

### Phase 4: UI Components

- [ ] `components/live-events/MilestoneList.tsx` の Props に `onMilestoneAdd` / `onMilestoneEdit` / `onMilestoneDelete` を追加
- [ ] 「マイルストーンを追加」ボタンとフォーム（タイトル・期日）を実装
- [ ] 各マイルストーンカードに [編集] ボタンと編集フォームを実装（タイトル・期日変更）
- [ ] 各マイルストーンカードに [削除] ボタン（confirm確認あり）を実装
- [ ] 一覧ソートを `order` 順から `dueDate` 昇順（null末尾）に変更

### Phase 5: Page Integration

- [ ] `app/live-events/[id]/page.tsx` に `handleMilestoneAdd` ハンドラ追加（POST API → state更新）
- [ ] `app/live-events/[id]/page.tsx` に `handleMilestoneEdit` ハンドラ追加（PUT API → state更新）
- [ ] `app/live-events/[id]/page.tsx` に `handleMilestoneDelete` ハンドラ追加（DELETE API → state更新）
- [ ] `MilestoneList` に新規 props を渡す

### Phase 6: 動作確認

- [ ] マイルストーン追加が正常に動作する（タイトル必須バリデーション含む）
- [ ] マイルストーン編集（タイトル・期日）が正常に動作する
- [ ] マイルストーン削除（確認ダイアログ）が正常に動作する
- [ ] 期限近い順ソートが正しく表示される
- [ ] 既存機能（ステータス変更・タスク管理）が引き続き動作する

### Phase 7: Review

- [ ] コードレビュー・不要なコードの整理

## Progress Tracking

**Overall**: 0% (0/18 tasks)

- Phase 1 (Types): 0% (0/1)
- Phase 2 (API Client): 0% (0/2)
- Phase 3 (API Routes): 0% (0/2)
- Phase 4 (UI Components): 0% (0/5)
- Phase 5 (Page Integration): 0% (0/4)
- Phase 6 (動作確認): 0% (0/5)
- Phase 7 (Review): 0% (0/1)

## Development Log

### Session 1: 2026-04-30
**Goal**: 設計書作成

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] 設計書（requirements.md / design.md / tasks.md）生成

**Next Session**:
- [ ] Phase 1〜3（Types / API Client / API Routes）の実装

---

## Blockers

### Active Blockers
None currently

## Notes

### Key Decisions
- 一覧ソートは `dueDate` 昇順（null末尾）とし、`order` フィールドは作成時の採番のみに使用
- 権限制御は既存ポリシー（セッション確認のみ）に準拠し、追加の権限テーブルは導入しない
- フォームはモーダルではなくインライン展開方式を優先（既存Expenseタブのパターン参考）
