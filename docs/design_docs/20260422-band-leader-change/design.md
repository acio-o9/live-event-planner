# Design: Band Leader Change

**Status**: Draft
**Created**: 2026-04-22
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [x] API Services      [x] Types/Interfaces

Custom Hooks は不要（シンプルな1アクション操作のため）

## Implementation（実装詳細）

### 1. Type Layer

**追加インターフェース** (`lib/types.ts`):
```typescript
export interface UpdateBandLeaderRequest {
  userSub: string;
}
```

### 2. API Route Layer

**新規エンドポイント**: `app/api/live-events/[id]/bands/[liveEventBandId]/leader/route.ts`

```
PUT /api/live-events/{id}/bands/{liveEventBandId}/leader
Body: { "userSub": "string" }
Response 200: EventBand（更新後の全メンバー情報を含む）
```

実装ロジック:
- `requireSession()` で認証確認
- バンドの存在確認（`liveEventId` 一致チェック）
- 対象メンバーのバンド所属確認
- トランザクションで: 現リーダー → "member"、対象メンバー → "leader"
- 更新後の `EventBand` を `serializeEventBand` で返却

```typescript
// トランザクション処理
await prisma.$transaction([
  prisma.eventBandMember.updateMany({
    where: { eventBandId: params.liveEventBandId, role: "leader" },
    data: { role: "member" },
  }),
  prisma.eventBandMember.update({
    where: { eventBandId_userSub: { eventBandId: params.liveEventBandId, userSub: body.userSub } },
    data: { role: "leader" },
  }),
]);
```

### 3. API Service Layer

**変更ファイル**: `lib/api/live-events.ts`

```typescript
async changeLeader(
  liveEventId: string,
  bandId: string,
  body: UpdateBandLeaderRequest
): Promise<EventBand> {
  const res = await fetch(
    `/api/live-events/${liveEventId}/bands/${bandId}/leader`,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### 4. Component Layer

**変更ファイル**: `components/live-events/BandMembersModal.tsx`

変更点:
1. `handleChangeLeader(userSub: string)` ハンドラを追加
2. メンバー一覧で「リーダー」ラベルを「バンドマスター」に変更
3. 非バンドマスターメンバーの行に「バンドマスターに変更」ボタンを追加
4. バンドマスター行は「削除」ボタン非表示のまま維持

```tsx
const handleChangeLeader = async (userSub: string) => {
  setError(null);
  try {
    const updated = await liveEventsApi.changeLeader(liveEventId, band.id, { userSub });
    onUpdate(updated);
  } catch (e) {
    setError(e instanceof Error ? e.message : "バンドマスターの変更に失敗しました");
  }
};

// メンバー行のUI
<li key={m.userSub} className="flex items-center justify-between py-1">
  <span className="text-sm text-gray-800">
    {m.user.nickname}
    {m.role === "leader" && (
      <span className="ml-1 text-xs text-blue-500">バンドマスター</span>
    )}
  </span>
  <div className="flex gap-2">
    {m.role !== "leader" && (
      <>
        <button onClick={() => handleChangeLeader(m.userSub)} className="text-xs text-blue-600 hover:text-blue-800">
          バンドマスターに変更
        </button>
        <button onClick={() => handleRemove(m.userSub)} className="text-xs text-gray-400 hover:text-red-600">
          削除
        </button>
      </>
    )}
  </div>
</li>
```

## Permission Control（必須）

現状の実装は `requireSession()` による認証のみ。
バンドマスター変更はログイン済みユーザーであれば実行可能とする（既存メンバー操作と同等の権限レベル）。
将来的に細かい権限制御が必要になった場合は別途設計する。

## API Specification

### エンドポイント

```
PUT /api/live-events/{liveEventId}/bands/{liveEventBandId}/leader

Request Body:
{
  "userSub": "string"  // バンドマスターに変更するメンバーのsub
}

Response 200:
{
  // EventBand（serializeEventBandの出力）
  "id": "string",
  "name": "string",
  "members": [
    { "userSub": "string", "role": "leader" | "member", "user": { ... } }
  ]
}

Response 400: { "error": "userSub is required" }
Response 404: { "error": "Band not found" } | { "error": "Member not found" }
```

## Testing Strategy

### Unit Tests

- [ ] API route: 正常系（リーダー変更が原子的に完了する）
- [ ] API route: 異常系（バンド不存在、メンバー不存在）
- [ ] Component: 「バンドマスターに変更」ボタンのクリックで `changeLeader` が呼ばれる
- [ ] Component: 「バンドマスター」ラベルが表示される（「リーダー」が消えている）

### Test Coverage Target

- **Overall**: 85%以上
- **Critical paths (トランザクション処理)**: 100%

## Error Handling

- API route: DB エラーは 500 で返却
- Component: エラーメッセージをモーダル内に表示（既存の `error` state を利用）

## Performance Considerations

- **API Response**: < 500ms（トランザクション2クエリのみで軽量）
