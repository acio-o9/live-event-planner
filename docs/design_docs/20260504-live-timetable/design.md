# Design: ライブタイムテーブル管理

**Status**: Draft
**Created**: 2026-05-04
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

```
UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Routes) → Type Layer (Interfaces) → DB Layer (Prisma)
[x] Components        [x] Hooks/Utils           [x] API Routes        [x] Types/Interfaces    [x] DB/Migration
```

## Implementation（実装詳細）

### 1. Type Layer

**型定義** (`lib/types.ts` に追加):

```typescript
export type TLEventType = "rehearsal" | "performance" | "other";

export interface TimelineEvent {
  id: string;
  liveEventId: string;
  eventBandId: string | null;  // null = スタッフ共通
  type: TLEventType;
  startMin: number;            // タイムライン開始時刻(10:00)からの経過分
  durationMin: number;
  note: string;
}

export interface CreateTimelineEventRequest {
  eventBandId: string | null;
  type: TLEventType;
  startMin: number;
  durationMin: number;
  note: string;
}

export type UpdateTimelineEventRequest = Partial<CreateTimelineEventRequest>;
```

### 2. DB / Migration

**スキーマ変更** (`prisma/schema.prisma`):

```prisma
model TimelineEvent {
  id          String   @id @default(uuid())
  liveEventId String
  eventBandId String?
  type        String   // "rehearsal" | "performance" | "other"
  startMin    Int
  durationMin Int
  note        String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  liveEvent LiveEvent  @relation(fields: [liveEventId], references: [id], onDelete: Cascade)
  eventBand EventBand? @relation(fields: [eventBandId], references: [id], onDelete: SetNull)
}
```

`LiveEvent` と `EventBand` に逆リレーション追加:

```prisma
model LiveEvent {
  ...
  timelineEvents TimelineEvent[]
}

model EventBand {
  ...
  timelineEvents TimelineEvent[]
}
```

### 3. API Routes

**`app/api/live-events/[id]/timeline/route.ts`**:
- `GET` — `liveEventId` に紐づく全TimelineEventとEventBand一覧を返す
- `POST` — 新規TimelineEvent作成（`canManageEvent` チェック）

**`app/api/live-events/[id]/timeline/[eventId]/route.ts`**:
- `PUT` — TimelineEvent更新（`canManageEvent` チェック）
- `DELETE` — TimelineEvent削除（`canManageEvent` チェック）

### 4. Custom Hooks

**`hooks/useTimelineEvents.ts`**:

```typescript
export function useTimelineEvents(liveEventId: string) {
  return {
    events: TimelineEvent[],
    bands: { id: string; name: string }[],
    isLoading: boolean,
    create: (req: CreateTimelineEventRequest) => Promise<void>,
    update: (id: string, req: UpdateTimelineEventRequest) => Promise<void>,
    remove: (id: string) => Promise<void>,
    bulkReplace: (events: CreateTimelineEventRequest[]) => Promise<void>,  // 叩き生成用
  }
}
```

### 5. Component Layer

**`components/timeline/TimelineView.tsx`** (既存から更新):
- `liveEventId` prop を受け取り、`useTimelineEvents` でデータ取得
- バンド列は EventBand 一覧から動的生成（ハードコードの b1〜b8 を廃止）
- 保存はドラッグ終了・モーダル送信時に即時API呼び出し

**`components/timeline/TimelineEventModal.tsx`** (分離):
- バンド列・スタッフ列で分岐するモーダルを独立コンポーネントとして切り出し

**`app/live-events/[id]/page.tsx`** (更新):
- `LiveEventDetailTab` 型に `"timeline"` を追加
- `TABS` 配列に `{ id: "timeline", label: "タイムライン" }` を追加
- タブコンテンツ切り替えに `{tab === "timeline" && <TimelineView liveEventId={id} />}` を追加

---

## Permission Control

既存の `canManageEvent()` (`lib/permissions.ts`) を活用。

| 操作 | admin | honki_kanrinin | user |
|------|-------|----------------|------|
| VIEW | ◯ | ◯ | ◯ |
| CREATE | ◯ | ◯ | ✕ |
| EDIT | ◯ | ◯ | ✕ |
| DELETE | ◯ | ◯ | ✕ |

- APIルートでサーバーサイドの `canManageEvent()` チェック
- UIではロールに応じてドラッグ・クリック追加・編集ボタンを非表示

---

## API Specification

### GET /api/live-events/[id]/timeline

```
Response 200:
{
  "events": [
    {
      "id": "uuid",
      "liveEventId": "uuid",
      "eventBandId": "uuid | null",
      "type": "rehearsal | performance | other",
      "startMin": 0,
      "durationMin": 30,
      "note": "逆リハ"
    }
  ],
  "bands": [
    { "id": "uuid", "name": "バンド名" }
  ]
}
```

### POST /api/live-events/[id]/timeline

```
Request Body:
{
  "eventBandId": "uuid | null",
  "type": "rehearsal | performance | other",
  "startMin": 0,
  "durationMin": 30,
  "note": "string"
}

Response 201: { "event": TimelineEvent }
```

### PUT /api/live-events/[id]/timeline/[eventId]

```
Request Body: Partial<CreateTimelineEventRequest>
Response 200: { "event": TimelineEvent }
```

### DELETE /api/live-events/[id]/timeline/[eventId]

```
Response 204: No Content
```

---

## Performance Considerations

- **Target**: 初期表示 3秒以内（タイムライン + バンド一覧の同時取得）
- **API Response**: < 500ms (p95)
- **Responsive**: 768px〜、スマホは横スクロールで全列閲覧可
