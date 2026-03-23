# Design: Band Calendar

**Status**: Draft
**Created**: 2026-03-20
**Developer**: maru

## Architecture（アーキテクチャ）

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [x] Hooks/Utils           [x] API Services      [x] Types/Interfaces

## Implementation（実装詳細）

### 1. Type Layer

```typescript
// lib/types.ts に追加

export interface BandSchedule {
  id: string;
  bandId: string;
  bandName: string;     // 表示用（Band.name）
  location: string;     // 場所
  startAt: string;      // ISO8601
  endAt: string;        // ISO8601
  createdBy: string;    // User.sub
  createdAt: string;
  updatedAt: string;
}

export interface CreateBandScheduleRequest {
  bandId: string;
  location: string;
  startAt: string;
  endAt: string;
}
```

### 2. API Service Layer

**Endpoints**:
```
GET    /api/schedules?from=YYYY-MM-DD&to=YYYY-MM-DD
POST   /api/schedules
DELETE /api/schedules/[scheduleId]
```

**GET /api/schedules** クエリパラメータ:
- `from`: 取得開始日（省略時: 当月1日）
- `to`: 取得終了日（省略時: 翌月末日）

**Response 200 (GET)**:
```json
{
  "schedules": [
    {
      "id": "uuid",
      "bandId": "uuid",
      "bandName": "Rock Band",
      "location": "渋谷スタジオ",
      "startAt": "2026-03-20T14:00:00Z",
      "endAt": "2026-03-20T17:00:00Z",
      "createdBy": "user-sub",
      "createdAt": "2026-03-20T00:00:00Z",
      "updatedAt": "2026-03-20T00:00:00Z"
    }
  ]
}
```

**権限チェック (POST/DELETE)**:
- ユーザーが対象バンドのメンバーであることを確認
- メンバーでない場合は 403 Forbidden

### 3. Custom Hooks

```typescript
// hooks/useSchedules.ts

export function useSchedules(from: string, to: string) {
  // 指定期間のスケジュール一覧取得
  return { schedules, isLoading, reload }
}

export function useScheduleMutations() {
  // 登録・削除操作
  return { create, remove }
}
```

### 4. Component Layer

**ページ構成**:
```
app/calendar/
  └── page.tsx                          # カレンダーページ

components/calendar/
  ├── CalendarView.tsx                  # 月表示カレンダー本体
  ├── CalendarCell.tsx                  # 日付セル（予定リスト表示）
  ├── ScheduleItem.tsx                  # 予定コンポーネント（バンド名・場所）
  └── ScheduleFormModal.tsx             # 予定登録モーダル
```

**CalendarView の仕様**:
- 当月・翌月の2ヶ月分タブ切り替え
- 日付セルに ScheduleItem を並べる
- 日付クリックで ScheduleFormModal を開く（所属バンドがある場合のみ）

**ScheduleItem の仕様**:
- バンド名 + 場所を1行で表示
- バンドごとに色分け（bandId のハッシュで色を決定）
- 自分のバンドの予定のみ削除ボタンを表示

**ナビゲーション追加**:
```typescript
// components/ui/Navigation.tsx
{ href: "/calendar", label: "カレンダー" }
```

### 5. Database Schema

`prisma/schema.prisma` に追加:
```prisma
model BandSchedule {
  id        String   @id @default(uuid())
  bandId    String
  location  String
  startAt   DateTime
  endAt     DateTime
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  band      Band @relation(fields: [bandId], references: [id], onDelete: Cascade)
  creator   User @relation(fields: [createdBy], references: [sub])
}
```

## Permission Control（必須）

### 権限ルール

- **閲覧**: ログインユーザー全員
- **登録**: 対象バンドのメンバーのみ
- **削除**: 対象バンドのメンバーのみ

### Implementation Points

- [ ] POST /api/schedules: `bandId` に対してユーザーのメンバーシップを確認
- [ ] DELETE /api/schedules/[id]: スケジュールの `bandId` に対してメンバーシップを確認
- [ ] UI: 所属バンドがない日付はクリックしても登録モーダルを開かない
- [ ] UI: 削除ボタンは所属バンドの予定のみ表示

## API Specification

### GET /api/schedules
```
Query Parameters:
  - from: string (YYYY-MM-DD, optional)
  - to: string (YYYY-MM-DD, optional)

Response 200: { schedules: BandSchedule[] }
```

### POST /api/schedules
```
Request Body:
  - bandId: string (required)
  - location: string (required)
  - startAt: string ISO8601 (required)
  - endAt: string ISO8601 (required)

Response 201: BandSchedule
Response 403: { error: "Forbidden" } （メンバーでない場合）
```

### DELETE /api/schedules/[scheduleId]
```
Response 204: No Content
Response 403: { error: "Forbidden" } （メンバーでない場合）
Response 404: { error: "Not Found" }
```

## Testing Strategy

### Unit Tests

- [ ] スケジュール期間フィルタリングロジック
- [ ] バンド色決定ロジック（bandId → 色）
- [ ] 日付グリッド生成ロジック（月の日付配列生成）

### Test Coverage Target

- **Overall**: 80%以上
- **Critical paths（権限チェック・日付ロジック）**: 100%

## Error Handling

- 登録時バリデーション: 終了日時 > 開始日時
- フィールドレベルエラー表示
- 権限エラーはトースト通知

## Performance Considerations

- **Target**: 初期表示 2秒以内
- 2ヶ月分のみ取得（全件取得しない）
- スケジュール数は少ない想定のためページネーション不要
