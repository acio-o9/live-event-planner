# Design: Milestone CRUD

**Status**: Draft
**Created**: 2026-04-30
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [ ] Hooks/Utils           [x] API Services      [x] Types/Interfaces

変更対象:
- `lib/types.ts` — `CreateMilestoneRequest` 追加
- `lib/api/live-events.ts` — `createMilestone` / `deleteMilestone` 追加
- `app/api/live-events/[id]/milestones/route.ts` — POST ハンドラ追加
- `app/api/live-events/[id]/milestones/[milestoneId]/route.ts` — DELETE ハンドラ追加
- `components/live-events/MilestoneList.tsx` — 追加・編集・削除UI実装
- `app/live-events/[id]/page.tsx` — 追加・削除ハンドラ追加

## Implementation（実装詳細）

### 1. Type Layer

**追加する型**:
```typescript
// lib/types.ts に追加
export interface CreateMilestoneRequest {
  title: string;
  dueDate?: string; // ISO 8601
}
```

既存の `UpdateMilestoneRequest` は title / dueDate / status を持っており、編集にはそのまま利用可能。

### 2. API Service Layer

**追加するAPIクライアントメソッド** (`lib/api/live-events.ts`):
```typescript
createMilestone: (id: string, data: CreateMilestoneRequest) =>
  fetchJson<Milestone>(`/api/live-events/${id}/milestones`, {
    method: "POST",
    body: JSON.stringify(data),
  }),

deleteMilestone: (id: string, milestoneId: string) =>
  fetchJson<void>(`/api/live-events/${id}/milestones/${milestoneId}`, {
    method: "DELETE",
  }),
```

### 3. API Specification

**POST /api/live-events/[id]/milestones**（新規追加）:
```
Request:
  { "title": string, "dueDate"?: string }

Response 201:
  Milestone（serializeMilestone 形式）

処理:
  - order は既存マイルストーン数 + 1
```

**DELETE /api/live-events/[id]/milestones/[milestoneId]**（新規追加）:
```
Response 204: No Content

処理:
  - milestoneId の存在確認（404）
  - liveEventId との一致確認（404）
  - prisma.milestone.delete
```

**PUT /api/live-events/[id]/milestones/[milestoneId]**（既存 — 変更なし）:
- title / dueDate / status の更新に対応済み

### 4. Component Layer

**MilestoneList.tsx の変更方針**:

```
[マイルストーンを追加] ボタン（リスト上部）
  → クリックでインラインフォーム or 小モーダル表示

各マイルストーンカードに [編集] [削除] ボタン追加
  編集: タイトル・期日を変更できるインラインフォーム
  削除: confirm() で確認後 DELETE API 呼び出し

ソート: dueDate 昇順（null/undefined は末尾）
```

**MilestoneList Props 変更**:
```typescript
interface Props {
  milestones: Milestone[];
  liveEventId: string;
  onMilestoneStatusChange: (milestoneId: string, status: Milestone["status"]) => Promise<void>;
  onMilestoneAdd: (data: CreateMilestoneRequest) => Promise<void>;       // 追加
  onMilestoneEdit: (milestoneId: string, data: UpdateMilestoneRequest) => Promise<void>; // 追加
  onMilestoneDelete: (milestoneId: string) => Promise<void>;             // 追加
}
```

**page.tsx の変更**:
- `handleMilestoneAdd` — POST API 呼び出し → state 更新
- `handleMilestoneEdit` — PUT API 呼び出し → state 更新（既存 handleMilestoneStatusChange と統合 or 別関数）
- `handleMilestoneDelete` — DELETE API 呼び出し → state 更新

## Permission Control（既存に準拠）

既存のライブイベント詳細ページは `AuthGuard` + セッション確認で制御されており、
イベントメンバーかどうかの細かい制御は現状行っていない（API側でセッション必須のみ）。
本機能も同じポリシーに準拠し、追加の権限制御は行わない。

## Testing Strategy

### 動作確認項目

- [ ] マイルストーンを追加 → 一覧に即時表示される
- [ ] マイルストーンのタイトル・期日を編集 → 反映される
- [ ] マイルストーンを削除 → 確認ダイアログが出て、OKで削除される
- [ ] 期限近い順ソートが正しく機能する（nullは末尾）
- [ ] 既存のステータス変更・タスク追加が引き続き動作する

## Error Handling

- タイトル未入力の場合はフォームバリデーションでブロック（送信させない）
- API エラー時は `alert()` or `console.error` で最小限の通知（既存パターンに合わせる）

## Notes

- `order` フィールドは作成時に `既存件数 + 1` で採番するのみ（ドラッグ並び替えは対象外）
- 一覧ソートは `dueDate` 昇順で行い、`order` は参照しない（UIでの表示順変更なし）
