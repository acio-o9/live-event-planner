# Design: User Role Permissions

**Status**: Draft
**Created**: 2026-05-02
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

```
UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Routes) → Type Layer (Interfaces) → DB Layer (Prisma)
[x] Components        [x] Hooks/Utils           [x] API Routes        [x] Types/Interfaces    [x] DB/Migration
```

## Implementation（実装詳細）

### 1. Type Layer

**型定義追加** (`lib/types.ts`):

```typescript
export type UserRole = "admin" | "honki_kanrinin" | "user";

export interface User {
  id: string;
  sub: string;
  nickname: string;
  avatarUrl?: string;
  role: UserRole;          // 追加
  instruments: Instrument[];
  deletedAt: string | null;
  createdAt: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
```

### 2. DB / Migration

**スキーマ変更** (`prisma/schema.prisma`):

```prisma
model User {
  ...
  role      String  @default("user")  // 追加: "admin" | "honki_kanrinin" | "user"
  ...
}
```

**マイグレーション**:
- `role` カラム追加（デフォルト: `"user"`）
- Data Migration: 既存ユーザー全員を `"admin"` にセット

```sql
-- マイグレーションファイル内に追記
UPDATE "User" SET role = 'admin';
```

### 3. Permissions Layer（新規）

**`lib/permissions.ts`**:

```typescript
import { UserRole } from "./types";

type SessionUser = { id: string; role: UserRole };

export function isAdmin(user: SessionUser): boolean {
  return user.role === "admin";
}

export function canManageEvent(user: SessionUser): boolean {
  return user.role === "admin" || user.role === "honki_kanrinin";
}

export function canEditBand(user: SessionUser, bandLeaderUserId: string): boolean {
  return canManageEvent(user) || user.id === bandLeaderUserId;
}

export function canEditSetlist(user: SessionUser, bandMemberUserIds: string[]): boolean {
  return canManageEvent(user) || bandMemberUserIds.includes(user.id);
}

export function canUpdateTaskStatus(user: SessionUser, assigneeUserId?: string | null): boolean {
  return canManageEvent(user) || user.id === assigneeUserId;
}

export function canChangeUserRole(changer: SessionUser, targetRole: UserRole): boolean {
  if (changer.role === "admin") return true;
  if (changer.role === "honki_kanrinin") return targetRole !== "admin";
  return false;
}

export function canRegisterExpense(user: SessionUser, bandMemberUserIds: string[]): boolean {
  return canManageEvent(user) || bandMemberUserIds.includes(user.id);
}

export function canEditExpense(user: SessionUser, paidByUserId: string): boolean {
  return canManageEvent(user) || user.id === paidByUserId;
}
```

### 4. API Routes 変更

各ルートの先頭で権限チェックを追加するパターン:

```typescript
const session = await auth();
if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (!canManageEvent(session.user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

**変更対象ルート一覧**:

| エンドポイント | チェック関数 |
|----------------|-------------|
| `POST /api/live-events` | `canManageEvent` |
| `PUT /api/live-events/[id]` | `canManageEvent` |
| `DELETE /api/live-events/[id]` | `canManageEvent` |
| `POST /api/live-events/[id]/bands` | `canManageEvent` |
| `PUT /api/live-events/[id]/bands/[id]` | `canManageEvent` OR `canEditBand` |
| `DELETE /api/live-events/[id]/bands/[id]` | `canManageEvent` |
| `POST /api/live-events/[id]/bands/[id]/members` | `canManageEvent` OR band leader |
| `DELETE /api/live-events/[id]/bands/[id]/members/[id]` | `canManageEvent` OR band leader |
| `PUT /api/live-events/[id]/bands/[id]/setlist` | `canEditSetlist` |
| `POST /api/live-events/[id]/milestones` | `canManageEvent` |
| `PUT /api/live-events/[id]/milestones/[id]` | `canManageEvent` |
| `DELETE /api/live-events/[id]/milestones/[id]` | `canManageEvent` |
| `PUT /api/live-events/[id]/milestones/[id]/tasks/[id]` （ステータス更新） | `canUpdateTaskStatus` |
| `POST /api/live-events/[id]/milestones/[id]/tasks` | `canManageEvent` |
| `DELETE /api/live-events/[id]/milestones/[id]/tasks/[id]` | `canManageEvent` |
| `POST /api/live-events/[id]/expenses` | `canRegisterExpense` |
| `PUT /api/live-events/[id]/expenses/[id]` | `canEditExpense` |
| `DELETE /api/live-events/[id]/expenses/[id]` | `canEditExpense` |
| `PATCH /api/users/[id]/role` （新規） | `canChangeUserRole` |

### 5. 新規 API エンドポイント

```
PATCH /api/users/[id]/role

Request:
{
  "role": "admin" | "honki_kanrinin" | "user"
}

Response 200:
{
  "id": "...",
  "nickname": "...",
  "role": "honki_kanrinin",
  ...
}

Response 403: { "error": "Forbidden" }
Response 400: { "error": "Invalid role" }
```

制約:
- `honki_kanrinin` は `admin` へのロール変更不可（admin のみ可）
- 自分自身のロールは変更不可（admin のみ可）

### 6. Custom Hooks 変更

**`hooks/useAuth.ts`**:
- セッションから `role` 情報を取得して返すよう拡張
- `canManageEvent` などのヘルパー結果を返す

```typescript
export function useAuth() {
  const { data: session } = useSession();
  const user = session?.user;

  return {
    user,
    isAdmin: user ? isAdmin(user) : false,
    canManageEvent: user ? canManageEvent(user) : false,
  };
}
```

### 7. Component Changes

**メンバー管理画面** (`app/members/` 配下):
- ユーザーロール表示バッジ追加（`admin` / `本気管理人` / `メンバー`）
- admin / honki_kanrinin 向けにロール変更セレクトボックスを表示
- `PATCH /api/users/[id]/role` を呼び出す

**各操作ボタンの表示制御**:
- ライブイベント作成ボタン → `canManageEvent` でないと非表示
- バンド情報編集ボタン → `canManageEvent` またはバンドリーダーでないと非表示
- マイルストーン・タスク作成ボタン → `canManageEvent` でないと非表示

### 8. Task.eventBandId Deprecation

- API: `Task` 作成・更新時に `eventBandId` を受け付けない（無視する）
- UI: バンド別タスクの作成 UI を削除
- DB: カラムは残存させる（既存データ保護のため即時削除はしない）

## Permission Control（必須）

権限マトリックスの詳細は [docs/permissions.md](../../permissions.md) を参照してください。

### Implementation Points

- [ ] API ルートでサーバーサイド権限チェック（403 返却）
- [ ] `hooks/useAuth.ts` でロール情報をフロントエンドに提供
- [ ] 権限外ボタン・フォームの非表示制御
- [ ] `lib/permissions.ts` の各関数は純粋関数として実装（テスト容易性）

## API Specification

詳細は「Implementation（実装詳細）」セクションの「4. API Routes 変更」および「5. 新規 API エンドポイント」を参照。

## Testing Strategy

### Unit Tests

- [ ] `lib/permissions.ts` の各関数: 全ロール・全引数組み合わせでテスト
- [ ] `PATCH /api/users/[id]/role`: 権限あり・なし・不正ロール値ケース
- [ ] 既存 API ルート: 権限なしで 403 が返ることを確認

### Test Coverage Target

- **Overall**: 80% 以上
- **`lib/permissions.ts`**: 100%

## Error Handling

- 権限不足: `403 Forbidden` + `{ "error": "Forbidden" }`
- 未認証: `401 Unauthorized` + `{ "error": "Unauthorized" }`（既存挙動）
- 不正ロール値: `400 Bad Request` + `{ "error": "Invalid role" }`
