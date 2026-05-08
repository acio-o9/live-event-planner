# Tasks: Notice Updated At

**Status**: Not Started
**Created**: 2026-05-08
**Progress**: 0/20 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/types.ts` に `LiveEventNotice` インターフェースを追加
- [ ] `lib/types.ts` の `LiveEvent` から `noticeContent` を削除し `notice?: LiveEventNotice | null` を追加
- [ ] `lib/api/live-events.ts` のレスポンス型を更新

### Phase 2: DB Migration

- [ ] `prisma/schema.prisma` に `LiveEventNotice` モデルを追加
- [ ] `prisma/schema.prisma` の `LiveEvent` から `noticeContent` を削除し `notice` リレーションを追加
- [ ] `npx prisma migrate dev --name add_live_event_notice_table` でマイグレーション生成
- [ ] 生成されたマイグレーションSQLに既存データ移行クエリを追加（noticeContent → LiveEventNotice.content）
- [ ] `npx prisma generate` でクライアント再生成

### Phase 3: API Service Layer

- [ ] `lib/db/serializers.ts` の `serializeLiveEvent` を更新（notice リレーションを含める）
- [ ] `app/api/live-events/[id]/route.ts` の Prisma クエリに `include: { notice: true }` を追加
- [ ] `app/api/live-events/[id]/notice/route.ts` の PUT を `upsert` に変更し `updatedBy` を記録、レスポンスに `updatedAt` を追加

### Phase 4: UI Components

- [ ] `lib/utils/date.ts`（または既存ユーティリティ）に `formatDateTime` 関数を追加（YYYY/MM/DD HH:mm）
- [ ] `components/live-events/NoticeTab.tsx` の props を `noticeContent` から `notice: LiveEventNotice | null` に変更
- [ ] `NoticeTab.tsx` に最終更新日時表示を追加（notice が null の場合は非表示）
- [ ] `app/live-events/[id]/page.tsx` の `noticeContent` 参照を `notice` に更新

### Phase 5: Permission Control（必須）

- [ ] 権限制御は既存の `canManageEvent()` を維持（変更不要であることを確認）

### Phase 6: Testing

- [ ] `PUT /api/live-events/[id]/notice` のテストに `updatedAt` 返却を追加
- [ ] `GET /api/live-events/[id]` のテストに `notice.updatedAt` 含有を追加
- [ ] `NoticeTab` のテストに更新日時表示・非表示ケースを追加
- [ ] `formatDateTime` のユニットテストを追加

### Phase 7: Documentation & Review

- [ ] コードレビューと動作確認（連絡事項の更新日時表示・編集保存後の反映）

## Progress Tracking

**Overall**: 0% (0/20 tasks)

- Phase 1 (Types & Interfaces): 0% (0/3)
- Phase 2 (DB Migration): 0% (0/4)
- Phase 3 (API Service): 0% (0/3)
- Phase 4 (UI Components): 0% (0/4)
- Phase 5 (Permission Control): 0% (0/1)
- Phase 6 (Testing): 0% (0/4)
- Phase 7 (Documentation): 0% (0/1)

## Development Log

### Session 1: 2026-05-08
**Goal**: 設計書作成

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] 設計書（requirements.md / design.md / tasks.md）作成

**Next Session**:
- [ ] Phase 1: Types & Interfaces から実装開始

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- `LiveEvent.noticeContent` を廃止し `LiveEventNotice` テーブルへ移行
  - 理由: `LiveEvent.updatedAt` は他のフィールド変更でも更新されるため、連絡事項の更新日時を正確に追跡できない
- `updatedBy` も記録しておく（将来の「誰が更新したか」表示に備えて）
- 日時フォーマットは `formatDateTime` ユーティリティ関数に集約

### Lessons Learned
（実装後に記録）

### AI Time Savings
（実装後に記録）
