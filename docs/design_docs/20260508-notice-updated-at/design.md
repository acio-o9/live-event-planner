# Design: Notice Updated At

**Status**: Draft
**Created**: 2026-05-08
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [ ] Hooks/Utils           [x] API Services      [x] Types/Interfaces

DB層も変更あり: `LiveEvent.noticeContent` を廃止し、`LiveEventNotice` モデルを新設

## Implementation（実装詳細）

### 1. DB Migration

`prisma/schema.prisma` の変更:

```prisma
// 新規追加
model LiveEventNotice {
  liveEventId String   @id
  content     String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?

  liveEvent LiveEvent @relation(fields: [liveEventId], references: [id], onDelete: Cascade)
  updater   User?     @relation(fields: [updatedBy], references: [id], onUpdate: Cascade)
}

// LiveEvent から noticeContent を削除
model LiveEvent {
  // noticeContent String?  ← 削除
  notice LiveEventNotice?  // ← リレーション追加
}
```

マイグレーション手順:
1. `prisma/schema.prisma` を変更
2. `npx prisma migrate dev --name add_live_event_notice_table` でマイグレーション生成
3. 生成されたSQLに既存データ移行クエリを追加:
   ```sql
   INSERT INTO "LiveEventNotice" ("liveEventId", "content", "updatedAt")
   SELECT id, "noticeContent", NOW()
   FROM "LiveEvent"
   WHERE "noticeContent" IS NOT NULL;
   ```
4. `ALTER TABLE "LiveEvent" DROP COLUMN "noticeContent";` は自動生成されるか確認

### 2. Type Layer

**`lib/types.ts` への変更**:
```typescript
// LiveEventNotice 型を新規追加
export interface LiveEventNotice {
  liveEventId: string;
  content: string | null;
  updatedAt: string; // ISO 8601
  updatedBy: string | null;
}

// LiveEvent から noticeContent を削除し、notice リレーションを追加
export interface LiveEvent {
  // noticeContent?: string;  ← 削除
  notice?: LiveEventNotice | null;  // ← 追加
}
```

### 3. Serializer

**`lib/db/serializers.ts` への変更**:
```typescript
// serializeLiveEvent に notice リレーションを追加
export function serializeLiveEvent(event: PrismaLiveEventWithRelations): LiveEvent {
  return {
    // 既存フィールド...
    notice: event.notice
      ? {
          liveEventId: event.notice.liveEventId,
          content: event.notice.content,
          updatedAt: event.notice.updatedAt.toISOString(),
          updatedBy: event.notice.updatedBy,
        }
      : null,
  };
}
```

Prismaクエリに `include: { notice: true }` を追加。

### 4. API Service Layer

**`app/api/live-events/[id]/notice/route.ts` の変更**:
```typescript
// PUT: LiveEventNotice を upsert し、updatedBy を記録
await prisma.liveEventNotice.upsert({
  where: { liveEventId: id },
  update: { content: body.content, updatedBy: session.user.id },
  create: { liveEventId: id, content: body.content, updatedBy: session.user.id },
});
```

**`app/api/live-events/[id]/route.ts` の変更**:
- `include` に `notice: true` を追加して `updatedAt` を返す

**`lib/api/live-events.ts` の変更**:
- レスポンス型を `LiveEvent`（notice フィールド含む）に更新

### 5. Component Layer

**`components/live-events/NoticeTab.tsx` の変更**:

```typescript
interface NoticeTabProps {
  liveEventId: string;
  notice: LiveEventNotice | null | undefined;  // noticeContent → notice に変更
  canEdit: boolean;
}
```

最終更新日時の表示:
```typescript
// 表示エリアに追加
{notice?.updatedAt && (
  <p className="text-xs text-gray-500">
    最終更新: {formatDateTime(notice.updatedAt)}  {/* YYYY/MM/DD HH:mm */}
  </p>
)}
```

日時フォーマット関数 (`lib/utils/date.ts` または既存ユーティリティ):
```typescript
export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}
```

**`app/live-events/[id]/page.tsx` の変更**:
- `noticeContent` の参照を `notice` に変更

## Permission Control（必須）

変更なし。既存の `canManageEvent()` 関数をそのまま使用。

### Implementation Points

- [x] `canManageEvent` による編集権限チェック（既存関数を流用）
- [x] APIルートでの `canManageEvent` チェック（403 返却）
- [x] UIレベルでの編集モード制御（`canEdit` prop）

## API Specification

### PUT /api/live-events/[id]/notice（変更）

```
Authorization: admin または honki_kanrinin
Request Body:
{
  "content": "# 連絡事項\n\n- 開場は18:00です\n"
}

Response 200:
{
  "content": "# 連絡事項\n\n- 開場は18:00です\n",
  "updatedAt": "2026-05-08T10:30:00.000Z"
}
```

### GET /api/live-events/[id]（変更）

```
Response 200 (notice フィールド追加):
{
  ...既存フィールド,
  "notice": {
    "liveEventId": "xxx",
    "content": "# 連絡事項...",
    "updatedAt": "2026-05-08T10:30:00.000Z",
    "updatedBy": "user-id"
  }
}
```

## Testing Strategy

### Unit Tests

- [ ] `PUT /api/live-events/[id]/notice`: upsert後に `updatedAt` が返ること
- [ ] `GET /api/live-events/[id]`: notice.updatedAt が含まれること
- [ ] `NoticeTab`: 更新日時が YYYY/MM/DD HH:mm 形式で表示されること
- [ ] `NoticeTab`: notice が null の場合に更新日時が表示されないこと
- [ ] `formatDateTime`: 正しいフォーマットに変換されること

### Test Coverage Target

- **Overall**: 80%以上
- **Critical paths (日時フォーマット・null ガード)**: 100%

## Error Handling

- マイグレーション失敗時: ロールバックして調査
- notice が null の場合: updatedAt 非表示（クラッシュしない）

## Performance Considerations

- `GET /api/live-events/[id]` に `include: { notice: true }` を追加するが、1対1リレーションのため負荷は軽微
- 追加APIリクエストは不要
