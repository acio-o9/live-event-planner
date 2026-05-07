# Design: Live Notice Tab

**Status**: Draft
**Created**: 2026-05-07
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [ ] Hooks/Utils           [x] API Services      [x] Types/Interfaces

DB層も変更あり: `LiveEvent` モデルに `noticeContent` フィールドを追加

## Implementation（実装詳細）

### 1. DB Migration

`prisma/schema.prisma` の `LiveEvent` モデルに追加:
```prisma
model LiveEvent {
  // 既存フィールド...
  noticeContent String?  // 連絡事項（マークダウン）
}
```

マイグレーション実行:
```bash
npx prisma migrate dev --name add_live_event_notice_content
```

### 2. Type Layer

**`lib/types.ts` への変更**:
```typescript
// LiveEventDetailTab に notice を追加（先頭に）
export type LiveEventDetailTab = "notice" | "bands" | "milestones" | "expenses" | "timeline";

// LiveEvent に noticeContent を追加
export interface LiveEvent {
  // 既存フィールド...
  noticeContent?: string;  // 連絡事項（マークダウン）
}

// 新規追加: notice更新リクエスト型
export interface UpdateNoticeRequest {
  content: string;
}
```

### 3. Serializer

**`lib/db/serializers.ts` への変更**:
- `serializeLiveEvent` 関数で `noticeContent` を含める

### 4. API Service Layer

**新規エンドポイント: `app/api/live-events/[id]/notice/route.ts`**:
```
PUT /api/live-events/[id]/notice
Authorization: admin または honki_kanrinin のみ
Request:  { content: string }
Response: { content: string }
```

- `canManageEvent()` による権限チェック（既存関数を使用）
- `GET` は不要（既存の `GET /api/live-events/[id]` に `noticeContent` が含まれる）

**`lib/api/live-events.ts` に追加**:
```typescript
updateNotice: (id: string, data: UpdateNoticeRequest) =>
  fetchJson<{ content: string }>(`/api/live-events/${id}/notice`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
```

### 5. Component Layer

**新規コンポーネント: `components/live-events/NoticeTab.tsx`**:

```typescript
interface NoticeTabProps {
  liveEventId: string;
  initialContent: string | undefined;
  canEdit: boolean;
}
```

**表示モード**:
- `noticeContent` が null/undefined: 「連絡事項はまだありません」メッセージ
- `noticeContent` がある: markdown-it でレンダリングした HTML を `dangerouslySetInnerHTML` で表示
- `canEdit` が true の場合: エリアにホバーで編集ヒント表示、クリックで編集モードへ

**編集モード**:
- `<textarea>` でマークダウン入力
- 「保存」ボタン: API呼び出し後に表示モードへ
- 「キャンセル」ボタン: 変更破棄して表示モードへ

**markdown-it 設定**:
```typescript
import MarkdownIt from "markdown-it";
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
```

**`app/live-events/[id]/page.tsx` への変更**:
- `tab === "notice"` のケースを追加
- `<NoticeTab>` にイベントの `noticeContent` と `canManageEvent` を渡す

**`components/live-events/LiveEventDetailTabs.tsx` への変更**:
- TABS配列の先頭に `{ id: "notice", label: "連絡事項" }` を追加

## Permission Control（必須）

既存の `canManageEvent()` 関数を使用（admin + honki_kanrinin が対象）:

```typescript
// 編集ボタン・クリックイベントの制御
const canEdit = canManageEvent(user);
```

### Implementation Points

- [x] `canManageEvent` による編集権限チェック（既存関数を流用）
- [x] APIルートでの `canManageEvent` チェック（403 返却）
- [x] UIレベルでの編集モード制御（`canEdit` prop）

## API Specification

### PUT /api/live-events/[id]/notice

```
Authorization: admin または honki_kanrinin
Request Body:
{
  "content": "# 連絡事項\n\n- 開場は18:00です\n"
}

Response 200:
{
  "content": "# 連絡事項\n\n- 開場は18:00です\n"
}

Response 403:
{ "error": "Forbidden" }

Response 404:
{ "error": "Not Found" }
```

## Testing Strategy

### Unit Tests

- [ ] `PUT /api/live-events/[id]/notice`: 正常更新・権限エラー・存在しないIDのテスト
- [ ] `NoticeTab`: 表示モード・編集モード・保存・キャンセルのレンダリングテスト

### Test Coverage Target

- **Overall**: 80%以上
- **Critical paths (権限チェック)**: 100%

## Error Handling

- 保存失敗時: `console.error` + ユーザー向けエラーメッセージ表示（インライン）
- XSS対策: `markdown-it` の `html: false` オプションで生HTML埋め込みを禁止

## Performance Considerations

- markdown-it インスタンスはモジュールスコープでシングルトン化（毎レンダリングで生成しない）
- `noticeContent` は既存の `GET /api/live-events/[id]` レスポンスに含めるため追加リクエスト不要
