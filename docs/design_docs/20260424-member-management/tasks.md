# Tasks: Member Management

**Status**: Not Started
**Created**: 2026-04-24
**Progress**: 0/22 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `prisma/schema.prisma` の `User` モデルに `deletedAt DateTime?` を追加
- [ ] `prisma migrate dev` でマイグレーション実行
- [ ] `lib/types.ts` の `User` 型に `deletedAt: string | null` を追加
- [ ] `lib/db/serializers.ts` の `serializeUser` に `deletedAt` を追加

### Phase 2: API Service Layer

- [ ] `app/api/users/route.ts` の GET に `where: { deletedAt: null }` フィルターを追加
- [ ] `app/api/users/route.ts` に `POST` ハンドラーを追加（sub: `dummy-{uuid}`、ニックネームバリデーション）
- [ ] `app/api/users/[id]/route.ts` を新規作成
- [ ] `PUT /api/users/[id]` — ニックネーム編集（バリデーション・404チェック）
- [ ] `DELETE /api/users/[id]` — 論理削除（deletedAt セット・404チェック）

### Phase 3: UI Components

- [ ] `components/profile/MemberList.tsx` に `onEdit` / `onDelete` コールバック Props を追加し、各行に編集・削除ボタンを表示
- [ ] `components/profile/MemberAddModal.tsx` を新規作成（ニックネーム入力 → POST /api/users）
- [ ] `components/profile/MemberEditModal.tsx` を新規作成（ニックネーム編集 → PUT /api/users/[id]）
- [ ] `components/profile/MemberDeleteDialog.tsx` を新規作成（確認ダイアログ → DELETE /api/users/[id]）
- [ ] `app/members/page.tsx` に追加ボタン・モーダル制御・操作後の一覧リフレッシュを追加

### Phase 4: Permission Control

- [ ] 既存の `requireSession` のみで制御（追加対応なし）
- [ ] 動作確認: ログアウト状態でAPIにアクセスして 401 が返ることを確認

### Phase 5: Testing

- [ ] `POST /api/users` のテストを追加（正常系・バリデーション）
- [ ] `PUT /api/users/[id]` のテストを追加（正常系・404・バリデーション）
- [ ] `DELETE /api/users/[id]` のテストを追加（論理削除・404）
- [ ] `MemberAddModal` / `MemberEditModal` / `MemberDeleteDialog` のコンポーネントテストを追加

### Phase 6: Documentation & Review

- [ ] 動作確認: 追加・編集・削除が一通り動作する
- [ ] 動作確認: 削除済みメンバーが一覧に表示されないことを確認
- [ ] コードレビューと最終確認

## Progress Tracking

**Overall**: 0% (0/22 tasks)

- Phase 1 (Types & Interfaces): 0% (0/4)
- Phase 2 (API Service): 0% (0/5)
- Phase 3 (UI Components): 0% (0/5)
- Phase 4 (Permission Control): 0% (0/2)
- Phase 5 (Testing): 0% (0/4)
- Phase 6 (Documentation): 0% (0/3)

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- 削除は論理削除（`deletedAt` フィールド）を採用。物理削除は行わない。
- ダミーメンバーの sub は `dummy-{uuid}` 形式で自動生成。
- 権限制御はログイン済みチェックのみ（バンドリーダー限定なし）。
