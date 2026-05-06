# Design: Timetable Band Sort

**Status**: Draft
**Created**: 2026-05-06
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [x] Hooks              [x] API Services      [x] Types/Interfaces

加えて: Prisma Schema 変更 + DB Migration が必要

## Implementation（実装詳細）

### 0. DB Schema Change

**`prisma/schema.prisma`** の `EventBand` モデルに `order` フィールドを追加:

```prisma
model EventBand {
  id          String   @id @default(cuid())
  liveEventId String
  name        String
  description String?
  createdBy   String
  order       Int      @default(0)   // 追加
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // ... relations
}
```

Migration コマンド（Docker内で実行）:
```bash
npx prisma migrate dev --name add-event-band-order
```

### 1. Type Layer

**`lib/types.ts`** の `EventBand` 型に `order` を追加:

```typescript
export interface EventBand {
  id: string;
  liveEventId: string;
  name: string;
  description?: string;
  createdBy: string;
  order: number;   // 追加
  createdAt: string;
  updatedAt: string;
  // ... existing relations
}
```

**新規型定義**（`lib/types.ts` に追加）:

```typescript
export interface ReorderBandsRequest {
  orderedIds: string[];
}
```

### 2. API Service Layer

**新規エンドポイント**: `app/api/live-events/[id]/bands/reorder/route.ts`

```
PATCH /api/live-events/[id]/bands/reorder
Authorization: canManageEvent (admin | honki_kanrinin)

Request Body:
{
  "orderedIds": ["bandId1", "bandId2", "bandId3"]
}

Response 200:
[
  { "id": "bandId1", "order": 0, ... },
  { "id": "bandId2", "order": 1, ... },
  ...
]

Response 403:
{ "error": "権限がありません" }

Response 400:
{ "error": "orderedIds is required" }
```

実装: `orderedIds` の各IDに対してPrisma `updateMany` で `order` を一括更新。

**既存エンドポイント変更**: `app/api/live-events/[id]/bands/route.ts`
- GET時のソート順を `createdAt asc` → `order asc, createdAt asc` に変更

### 3. Custom Hooks

**`hooks/useBandReorder.ts`**（新規）:

```typescript
export function useBandReorder(liveEventId: string, initialBands: EventBand[]) {
  // dnd-kit の useSortable と連携
  // 楽観的UI更新: ローカル状態を即時更新してからAPIを呼ぶ
  // エラー時はロールバック
}
```

### 4. Component Layer

**`components/live-events/BandList.tsx`**（新規 - page.tsxから分離）:

```typescript
// app/live-events/[id]/page.tsx の lines 149-190 相当を切り出し
// canManageEvent(user) が true の場合のみ dnd-kit の DndContext + SortableContext をレンダリング
// false の場合は通常リスト表示
export function BandList({ bands, liveEventId, canReorder }: BandListProps)
```

**`components/live-events/SortableBandItem.tsx`**（新規）:

```typescript
// dnd-kit の useSortable を使ってドラッグハンドル付きバンドカードを実装
// ドラッグハンドルアイコン（GripVertical）はcanReorder=trueのときのみ表示
export function SortableBandItem({ band, canReorder, ... }: SortableBandItemProps)
```

**`components/timeline/TimelineView.tsx`**（既存変更）:
- バンド一覧のソート順を `band.order asc` に変更
- APIから取得するバンドリストがすでに `order` 順で返ってくるので、追加のソートは不要なケースが多い

**ドラッグ&ドロップライブラリ**:
- `@dnd-kit/core` + `@dnd-kit/sortable` を追加
  - Reactフレンドリー、モバイルタッチ対応、アクセシビリティ対応
  - `@dnd-kit/utilities` も合わせてインストール

## Permission Control

既存の `lib/permissions.ts` に `canReorderBands` を追加:

```typescript
export function canReorderBands(user: PermissionUser): boolean {
  return canManageEvent(user); // admin | honki_kanrinin
}
```

### Implementation Points

- [ ] APIルート（PATCH /reorder）で `canManageEvent` チェック
- [ ] `BandList` コンポーネントで `canReorder` propsによりドラッグUI表示切り替え
- [ ] ドラッグハンドルは権限なしユーザーには非表示

## Testing Strategy

### Unit Tests

- [ ] `lib/permissions.ts`: `canReorderBands` の権限テスト（admin/honki_kanrinin/user）
- [ ] `PATCH /api/live-events/[id]/bands/reorder`: 権限チェック・order更新の確認
- [ ] `GET /api/live-events/[id]/bands`: レスポンスが `order asc` でソートされていること

### Test Coverage Target

- **Overall**: 80%以上
- **Critical paths（権限・並び替えロジック）**: 100%

## Error Handling

- API 400: `orderedIds` が空または不正な場合
- API 403: 権限なしユーザーのアクセス
- フロント: API失敗時は楽観的UI更新をロールバックし、エラーを表示

## Performance Considerations

- **楽観的UI更新**: ドラッグ確定時にローカル状態を即時更新、バックグラウンドでAPI呼び出し
- **デバウンス不要**: DragEnd時の1回呼び出しのみ
