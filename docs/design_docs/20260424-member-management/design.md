# Design: Member Management

**Status**: Draft
**Created**: 2026-04-24
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [x] API Services      [x] Types/Interfaces

## Implementation（実装詳細）

### 1. Type Layer

**Schema Change** (`prisma/schema.prisma`):
```prisma
model User {
  // 既存フィールドに追加
  deletedAt DateTime? // 論理削除
}
```

**Type Update** (`lib/types.ts`):
```typescript
export interface User {
  // 既存フィールドに追加
  deletedAt: string | null;
}
```

**Serializer Update** (`lib/db/serializers.ts`):
- `serializeUser` に `deletedAt` フィールドを追加

### 2. API Layer

**`app/api/users/route.ts`** — POST を追加:
```typescript
// POST /api/users — メンバー追加
// sub: `dummy-{uuid}` 形式で自動生成
// nickname バリデーション（全角10文字以内）
```

**`app/api/users/[id]/route.ts`** — 新規作成:
```typescript
// PUT /api/users/[id] — ニックネーム編集
// DELETE /api/users/[id] — 論理削除（deletedAt = now()）
```

**`app/api/users/route.ts`** の GET 修正:
- `where: { deletedAt: null }` で削除済みメンバーを除外

### 3. Component Layer

**Modified**:
- `app/members/page.tsx` — 追加ボタンと操作後の一覧リフレッシュを追加
- `components/profile/MemberList.tsx` — 各行に編集・削除ボタンを追加、onEdit/onDelete コールバック受け取り

**New**:
- `components/profile/MemberAddModal.tsx` — ニックネーム入力フォームと追加処理
- `components/profile/MemberEditModal.tsx` — ニックネーム編集フォームと更新処理
- `components/profile/MemberDeleteDialog.tsx` — 「本当に削除しますか？」確認ダイアログ

## Permission Control

権限制御なし。`requireSession` でログイン済みチェックのみ。

## API Specification

### POST /api/users

```
POST /api/users
Request Body:
  { "nickname": "string" }

Response 201:
  { id, sub, nickname, avatarUrl, instruments, deletedAt }

Error 400: ニックネームが空またはバリデーションエラー
```

### PUT /api/users/[id]

```
PUT /api/users/{id}
Request Body:
  { "nickname": "string" }

Response 200:
  { id, sub, nickname, avatarUrl, instruments, deletedAt }

Error 400: バリデーションエラー
Error 404: 存在しない or 削除済みユーザー
```

### DELETE /api/users/[id]

```
DELETE /api/users/{id}

Response 200:
  { "ok": true }

Error 404: 存在しない or 削除済みユーザー
```

## Testing Strategy

### Unit Tests

- [ ] `POST /api/users` — 正常系・ニックネームバリデーション
- [ ] `PUT /api/users/[id]` — 正常系・404・バリデーション
- [ ] `DELETE /api/users/[id]` — 論理削除の確認・404
- [ ] `MemberAddModal` — フォーム送信・エラー表示
- [ ] `MemberEditModal` — フォーム送信・エラー表示
- [ ] `MemberDeleteDialog` — 確認・キャンセル動作

### Test Coverage Target

- **Overall**: 80%以上
- **API Routes**: 100%

## Error Handling

- 存在しない ID への PUT/DELETE: 404
- `deletedAt` が設定済みのユーザーへの操作: 404
- ニックネームが空またはバリデーション違反: 400
- フロントエンドはエラーメッセージをモーダル内にインライン表示

## Performance Considerations

- 操作完了後にフロントエンドで `/api/users` を再取得して一覧をリフレッシュ
- API レスポンス: 1秒以内
