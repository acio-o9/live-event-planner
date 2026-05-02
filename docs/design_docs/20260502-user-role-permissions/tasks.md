# Tasks: User Role Permissions

**Status**: Not Started
**Created**: 2026-05-02
**Progress**: 0/29 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/types.ts` に `UserRole` 型（`"admin" | "honki_kanrinin" | "user"`）を追加
- [ ] `User` インターフェースに `role: UserRole` フィールドを追加
- [ ] `UpdateUserRoleRequest` インターフェースを追加

### Phase 2: DB / Migration

- [ ] `prisma/schema.prisma` の `User` モデルに `role String @default("user")` を追加
- [ ] `prisma migrate dev` でマイグレーションファイルを生成
- [ ] マイグレーションファイルに Data Migration（`UPDATE "User" SET role = 'admin'`）を追記
- [ ] `prisma generate` でクライアントを再生成

### Phase 3: Permissions Layer（新規）

- [ ] `lib/permissions.ts` を新規作成
- [ ] `isAdmin` / `canManageEvent` / `canEditBand` / `canEditSetlist` / `canUpdateTaskStatus` / `canChangeUserRole` / `canRegisterExpense` / `canEditExpense` を実装

### Phase 4: API Routes

- [ ] `POST /api/live-events` に `canManageEvent` チェックを追加
- [ ] `PUT /api/live-events/[id]` に `canManageEvent` チェックを追加
- [ ] `DELETE /api/live-events/[id]` に `canManageEvent` チェックを追加
- [ ] `POST /api/live-events/[id]/bands` に `canManageEvent` チェックを追加
- [ ] バンド情報・削除 API に `canManageEvent` チェックを追加
- [ ] バンドメンバー追加・削除 API に `canManageEvent` OR バンドリーダーチェックを追加
- [ ] セットリスト編集 API に `canEditSetlist` チェックを追加
- [ ] マイルストーン CRUD API に `canManageEvent` チェックを追加
- [ ] タスクステータス更新 API に `canUpdateTaskStatus` チェックを追加（タスク作成・削除は `canManageEvent`）
- [ ] 経費 API に `canRegisterExpense` / `canEditExpense` チェックを追加
- [ ] `PATCH /api/users/[id]/role` エンドポイントを新規作成（`app/api/users/[id]/role/route.ts`）

### Phase 5: Hooks & Components

- [ ] `hooks/useAuth.ts` に `role` 情報・`canManageEvent` ヘルパーを追加
- [ ] メンバー管理画面にロール表示バッジを追加
- [ ] メンバー管理画面に admin / 本気管理人向けロール変更 UI を追加（`PATCH /api/users/[id]/role` 呼び出し）
- [ ] `Task.eventBandId` のUI利用箇所を削除（deprecated 対応）
- [ ] 各操作ボタン・フォームを権限に応じて表示制御（`canManageEvent` / `canEditBand` など）

### Phase 6: Testing

- [ ] `lib/permissions.ts` のユニットテストを作成（全関数・全ロール組み合わせ、カバレッジ 100%）
- [ ] `PATCH /api/users/[id]/role` のテストを作成
- [ ] 既存 API ルートの権限チェックテストを追加（権限なしで 403 を返すことを確認）
- [ ] テスト全体のカバレッジ 80% 以上を達成

### Phase 7: Documentation & Review

- [ ] `docs/permissions.md` を最新状態に保つ（機能追加時に随時更新）
- [ ] コードレビューとクリーンアップ

## Progress Tracking

**Overall**: 0% (0/29 tasks)

- Phase 1 (Types & Interfaces): 0% (0/3)
- Phase 2 (DB / Migration): 0% (0/4)
- Phase 3 (Permissions Layer): 0% (0/2)
- Phase 4 (API Routes): 0% (0/11)
- Phase 5 (Hooks & Components): 0% (0/5)
- Phase 6 (Testing): 0% (0/4)
- Phase 7 (Documentation): 0% (0/2)

## Development Log

### Session 1: 2026-05-02
**Goal**: Phase 1 & 2 の実装（Types & DB Migration）

**AI Tool**: Claude Code

**Tasks Completed**:
（実装後に記録）

**Next Session**:
- Phase 3: Permissions Layer 実装

---

## Blockers

### Active Blockers

None currently

### Resolved Blockers

（なし）

## Notes

### Key Decisions

- 本気管理人はグローバルロール（`User.role`）として実装。イベントをまたいで管理権限を持つ
- `EventManager` テーブルは不要（グローバルロールのため）
- `Task.eventBandId` は DB カラムとして残存させ、API・UI からの新規利用のみ停止
- マイグレーション時に既存ユーザー全員を `admin` にセット（破壊的変更なし）
- `honki_kanrinin` は admin へのロール昇格不可（admin のみ付与可能）

### Lessons Learned

（実装後に記録）
