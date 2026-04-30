# Design: Live Detail Tabs

**Status**: Draft
**Created**: 2026-04-30
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [x] Hooks/Utils           [ ] API Services      [x] Types/Interfaces

APIの変更は不要。既存のフックとコンポーネントを再利用する。

## Implementation（実装詳細）

### 1. Type Layer

**タブID型定義** (`lib/types.ts` または `components/live-events/LiveEventDetailTabs.tsx` 内):
```typescript
export type LiveEventDetailTab = "bands" | "milestones" | "expenses";
```

### 2. API Service Layer

変更なし。既存の `liveEventsApi`、`useExpenses`、`useExpenseSummary` をそのまま使用。

### 3. Custom Hooks

**タブ状態管理** (`app/live-events/[id]/page.tsx` 内、またはインライン実装):

```typescript
// useSearchParams でURLクエリパラメータからタブ状態を取得
// router.push でタブ切り替え時にURLを更新
const searchParams = useSearchParams();
const tab = (searchParams.get("tab") ?? "bands") as LiveEventDetailTab;
const handleTabChange = (newTab: LiveEventDetailTab) => {
  router.push(`/live-events/${id}?tab=${newTab}`);
};
```

`useSearchParams` を使うため、Suspense境界が必要（Next.js 14 App Routerの要件）。

### 4. Component Layer

#### 新規作成: `components/live-events/LiveEventDetailTabs.tsx`

タブナビゲーションUIのみを担当するプレゼンテーショナルコンポーネント。

```typescript
interface LiveEventDetailTabsProps {
  activeTab: LiveEventDetailTab;
  onTabChange: (tab: LiveEventDetailTab) => void;
}

const TABS: { id: LiveEventDetailTab; label: string }[] = [
  { id: "bands",      label: "バンド一覧" },
  { id: "milestones", label: "マイルストーン" },
  { id: "expenses",   label: "費用管理" },
];
```

スタイル例（Tailwind）:
```tsx
<div className="border-b border-gray-200">
  <nav className="-mb-px flex gap-4">
    {TABS.map((t) => (
      <button
        key={t.id}
        onClick={() => onTabChange(t.id)}
        className={`py-2 px-1 border-b-2 text-sm font-medium ${
          activeTab === t.id
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
      >
        {t.label}
      </button>
    ))}
  </nav>
</div>
```

#### 新規作成: `components/live-events/ExpenseTab.tsx`

現在の `app/live-events/[id]/expenses/page.tsx` のロジックをコンポーネントとして切り出す。
ページヘッダー（「← 戻る」「費用管理」見出し）は含めず、コンテンツのみ。

```typescript
interface ExpenseTabProps {
  liveEventId: string;
}
```

内部で `useExpenses`、`useExpenseSummary`、`liveEventsApi.get` を使用し、
`ExpenseSummary`・`ExpenseList`・`ExpenseFormModal` をレンダリングする。

#### 変更: `app/live-events/[id]/page.tsx`

- `useSearchParams` + `router.push` でタブ状態管理
- ページヘッダー（タイトル・日付・会場・フォトアルバムリンク）はタブの外に維持
- `<LiveEventDetailTabs>` でタブナビゲーションを表示
- `activeTab` に応じてバンド一覧 / マイルストーン / 費用管理コンテンツを切り替え
- 費用管理の「費用を管理 →」リンクセクションを削除し、`<ExpenseTab>` に置き換え
- `useSearchParams` のために `<Suspense>` ラッパーが必要

```tsx
// page.tsx の構造イメージ
export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<LoadingSpinner />}>
        <LiveEventDetailPage />
      </Suspense>
    </AuthGuard>
  );
}

function LiveEventDetailPage() {
  // ...
  return (
    <div className="space-y-6">
      {/* ヘッダー部分（タブの外）*/}
      <header>...</header>

      {/* タブナビゲーション */}
      <LiveEventDetailTabs activeTab={tab} onTabChange={handleTabChange} />

      {/* タブコンテンツ */}
      {tab === "bands" && <BandsSection ... />}
      {tab === "milestones" && <MilestoneList ... />}
      {tab === "expenses" && <ExpenseTab liveEventId={id} />}
    </div>
  );
}
```

## Permission Control（認証制御）

### 既存の実装を継続使用

このフィーチャーは既存ページのUI再構成であり、新しい権限レベルは不要。

```typescript
// 既存の認証制御（変更なし）
export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<LoadingSpinner />}>
        <LiveEventDetailPage />
      </Suspense>
    </AuthGuard>
  );
}
```

### Implementation Points

- [x] `AuthGuard` がページレベルの認証を担保（変更なし）
- [ ] 費用追加ボタンの表示は認証ユーザーのみ（既存 `useExpenses` フック経由）
- [ ] バンド追加・削除ボタンは既存ロジックを維持

## API Specification

変更なし。以下の既存エンドポイントを引き続き使用:

- `GET /api/live-events/[id]` — ライブ詳細（バンド・マイルストーン含む）
- `GET /api/live-events/[id]/expenses` — 費用一覧
- `POST /api/live-events/[id]/expenses` — 費用登録
- `PUT /api/live-events/[id]/expenses/[expenseId]` — 費用更新
- `DELETE /api/live-events/[id]/expenses/[expenseId]` — 費用削除
- `GET /api/live-events/[id]/expenses/summary` — 費用サマリー

## Testing Strategy

### Unit Tests

- [ ] `LiveEventDetailTabs`: アクティブタブのスタイル切り替えテスト
- [ ] `ExpenseTab`: 費用一覧・サマリーのレンダリングテスト
- [ ] `page.tsx`: URLパラメータ変更でタブが切り替わるテスト

### Test Coverage Target

- **Overall**: 既存カバレッジを維持
- **新規コンポーネント**: 主要な分岐をカバー

## Error Handling

- 費用一覧の取得失敗時は `ExpenseTab` 内でエラーメッセージ表示
- ローディング中は `LoadingSpinner` 表示（費用タブ初期表示時のみ）

## Performance Considerations

- タブ切り替え自体は即時（クライアントサイドのみ）
- 「費用管理」タブは初回表示時のみAPIフェッチ（`useExpenses` フックの初期ロード）
- バンド一覧・マイルストーンのデータはページ初期ロード時に一括取得済み（変更なし）
