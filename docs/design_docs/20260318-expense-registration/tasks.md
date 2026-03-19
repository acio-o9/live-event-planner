# Tasks: Expense Registration

**Status**: In Progress
**Created**: 2026-03-18
**Progress**: 20/26 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [x] `Expense` インターフェースを `lib/types.ts` に追加
- [x] `ExpenseFormData` インターフェースを追加
- [x] `ExpenseSummary` インターフェースを追加
- [x] Prisma スキーマに `Expense` モデルを追加
- [x] `prisma migrate dev` でマイグレーション実行

### Phase 2: API Service Layer

- [x] `lib/api/expenses.ts` を作成（クライアントAPI）
- [x] `GET /api/live-events/[id]/expenses` を実装
- [x] `POST /api/live-events/[id]/expenses` を実装
- [x] `PUT /api/live-events/[id]/expenses/[expenseId]` を実装
- [x] `DELETE /api/live-events/[id]/expenses/[expenseId]` を実装
- [x] `GET /api/live-events/[id]/expenses/summary` を実装（合計・一人当たり計算）

### Phase 3: Custom Hooks

- [x] `hooks/useExpenses.ts` を作成（一覧・CRUD）
- [x] `hooks/useExpenses.ts` に `useExpenseSummary` も含む（サマリー取得）
- [x] ローディング・エラー状態の管理

### Phase 4: UI Components

- [x] `components/expenses/ExpenseList.tsx` を作成
- [x] `components/expenses/ExpenseForm.tsx` を作成（金額・立替者・カテゴリ・メモ）
- [x] `components/expenses/ExpenseFormModal.tsx` を作成
- [x] `components/expenses/ExpenseSummary.tsx` を作成（合計・一人当たり負担額・精算表）
- [x] `app/live-events/[id]/expenses/page.tsx` を作成
- [x] イベント詳細ページから費用ページへのリンクを追加

### Phase 5: Permission Control（必須）

- [ ] `lib/permissions.ts` に `EXPENSE` 権限定数を追加
- [ ] ページレベルの権限ガードを実装
- [ ] 登録・編集・削除ボタンに権限チェックを追加

### Phase 6: Testing

- [x] サマリー計算ロジックのユニットテスト（`lib/__tests__/expense-utils.test.ts`・17テスト）
- [x] Expense 型定義テスト（`lib/__tests__/expense-types.test.ts`）
- [ ] useExpenses / useExpenseSummary のテスト
- [ ] ExpenseForm のバリデーションテスト
- [x] テストカバレッジ 80%以上を確認（`expense-utils.ts` 100%）

### Phase 7: Documentation & Review

- [ ] `docs/design_docs/20260318-expense-registration/` の設計書を最終更新
- [ ] コードレビューと修正
- [ ] レスポンシブ動作確認（スマートフォン）

## Progress Tracking

**Overall**: 88% (23/26 tasks)

- Phase 1 (Types & Interfaces): 100% (5/5)
- Phase 2 (API Service): 100% (6/6)
- Phase 3 (Custom Hooks): 100% (3/3)
- Phase 4 (UI Components): 100% (6/6)
- Phase 5 (Permission Control): 0% (0/3)
- Phase 6 (Testing): 60% (3/5)
- Phase 7 (Documentation): 0% (0/3)

## Development Log

### Session 1: 2026-03-18
**Goal**: 設計書作成

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] 設計書（requirements.md / design.md / tasks.md）作成

---

### Session 2: 2026-03-18 23:00-23:29
**Goal**: Phase 1〜4 の実装（Types・API・Hooks・Components）

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] Expense型・ExpenseFormData型・ExpenseSummary型を lib/types.ts に追加
- [x] prisma/schema.prisma に Expense モデル追加・マイグレーション実行
- [x] lib/db/serializers.ts に serializeExpense 追加
- [x] API routes 5本を実装（GET/POST/PUT/DELETE/summary）
- [x] lib/api/expenses.ts クライアントAPI作成
- [x] hooks/useExpenses.ts（useExpenses + useExpenseSummary）作成
- [x] ExpenseForm / ExpenseFormModal / ExpenseList / ExpenseSummary コンポーネント作成
- [x] app/live-events/[id]/expenses/page.tsx 作成
- [x] イベント詳細ページに費用管理リンク追加

**Next Session**:
- [ ] Phase 5: Permission Control
- [ ] Phase 6: Testing

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- 金額は円単位の整数で管理（小数点不要）
- 精算計算: 一人当たり負担額 = 合計 ÷ 参加人数（端数は切り上げ）、差額 = 立替金額 - 一人当たり負担額
- 初期実装ではページネーション不要（費用件数は少ない想定）
- ファイルは `src/` なしのルート直下に配置（既存プロジェクト構成に合わせた）
- `useExpenseSummary` は `useExpenses.ts` に同居（ファイル分割不要なシンプルさを優先）
- 現在の権限システムは未実装（types.ts にコメントアウト済み）のため Phase 5 は設計書更新のみとする

### Lessons Learned
（実装後に記録）

### AI Time Savings
Session 2: 約 90〜120 分の実装を AI との協働で 30 分以内に完了
