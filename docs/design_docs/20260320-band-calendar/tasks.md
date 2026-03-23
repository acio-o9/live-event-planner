# Tasks: Band Calendar

**Status**: In Progress
**Created**: 2026-03-20
**Progress**: 25/28 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [x] `BandSchedule` インターフェースを `lib/types.ts` に追加
- [x] `CreateBandScheduleRequest` インターフェースを追加
- [x] Prisma スキーマに `BandSchedule` モデルを追加
- [x] `Band` モデルに `schedules` リレーションを追加
- [x] `User` モデルに `createdSchedules` リレーションを追加
- [x] `prisma migrate dev` でマイグレーション実行

### Phase 2: API Service Layer

- [x] `lib/db/serializers.ts` に `serializeBandSchedule` を追加
- [x] `GET /api/schedules` を実装（from/to クエリで期間絞り込み）
- [x] `POST /api/schedules` を実装（バンドメンバーシップ確認）
- [x] `DELETE /api/schedules/[scheduleId]` を実装（バンドメンバーシップ確認）
- [x] `lib/api/schedules.ts` クライアントAPIを作成

### Phase 3: Custom Hooks

- [x] `hooks/useSchedules.ts` を作成（一覧取得）
- [x] 登録・削除ミューテーションを実装
- [x] ローディング・エラー状態の管理

### Phase 4: UI Components

- [x] `components/calendar/ScheduleItem.tsx` を作成（バンド名・場所・削除ボタン）
- [x] `components/calendar/CalendarCell.tsx` を作成（日付セル）
- [x] `components/calendar/CalendarView.tsx` を作成（月表示グリッド・2ヶ月タブ）
- [x] `components/calendar/ScheduleFormModal.tsx` を作成（予定登録モーダル）
- [x] `app/calendar/page.tsx` を作成
- [x] `components/ui/Navigation.tsx` に「カレンダー」タブを追加

### Phase 5: Permission Control（必須）

- [x] POST API: バンドメンバーシップ確認ロジックを実装
- [x] DELETE API: バンドメンバーシップ確認ロジックを実装
- [x] UI: 所属バンドがない場合は登録モーダルを開かない
- [x] UI: 削除ボタンは所属バンドの予定のみ表示

### Phase 6: Testing

- [x] 日付グリッド生成ロジックのユニットテスト
- [x] バンド色決定ロジックのユニットテスト
- [x] 期間フィルタリングロジックのユニットテスト
- [ ] BandSchedule 型定義テスト
- [x] テストカバレッジ 80%以上を確認（13テスト追加、全69テスト通過）

### Phase 7: Documentation & Review

- [x] 設計書を最終更新
- [ ] コードレビューと修正
- [ ] レスポンシブ動作確認

## Progress Tracking

**Overall**: 89% (25/28 tasks)

- Phase 1 (Types & Interfaces): 100% (6/6)
- Phase 2 (API Service): 100% (5/5)
- Phase 3 (Custom Hooks): 100% (3/3)
- Phase 4 (UI Components): 100% (6/6)
- Phase 5 (Permission Control): 100% (4/4)
- Phase 6 (Testing): 80% (4/5)
- Phase 7 (Documentation): 33% (1/3)

## Development Log

### Session 1: 2026-03-20
**Goal**: 設計書作成

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] 設計書（requirements.md / design.md / tasks.md）作成

---

### Session 2: 2026-03-20
**Goal**: Phase 1-6 実装

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] Phase 1: Types & Interfaces（lib/types.ts, prisma/schema.prisma）
- [x] Phase 2: API Service Layer（GET/POST/DELETE + serializer + client API）
- [x] Phase 3: Custom Hooks（useSchedules, useScheduleMutations）
- [x] Phase 4: UI Components（ScheduleItem, CalendarCell, CalendarView, ScheduleFormModal, page.tsx, Navigation）
- [x] Phase 5: Permission Control（API + UI）
- [x] Phase 6: Testing（lib/__tests__/calendar-utils.test.ts, 13テスト追加）
- [x] カレンダーロジックを lib/calendar-utils.ts に抽出（テスト容易性向上）

**Next Session**:
- [ ] コードレビューと修正
- [ ] レスポンシブ動作確認

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- カレンダーは外部ライブラリを使わずシンプルな CSS グリッドで実装（依存関係を増やさない）
- 2ヶ月分のみ取得（当月・翌月）、月切り替えはタブ
- バンドの色分けは `bandId` の文字列ハッシュから HSL カラーを生成
- 終了日時 > 開始日時のバリデーションは API・UI 両方で実施
- カレンダーロジック（buildCalendarDays, schedulesForDate, bandColor）を `lib/calendar-utils.ts` に分離してテスト可能に

### Lessons Learned
（実装後に記録）

### AI Time Savings
（実装後に記録）
