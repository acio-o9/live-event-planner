# Design: Expense Registration

**Status**: Draft
**Created**: 2026-03-18
**Developer**: maru

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[x] Components        [x] Hooks/Utils           [x] API Services      [x] Types/Interfaces

## Implementation（実装詳細）

### 1. Type Layer

**Interface Definition**:
```typescript
// src/lib/types.ts に追加

export interface Expense {
  id: string;
  liveEventId: string;
  paidBy: string;         // User.sub
  paidByName: string;     // 表示用ニックネーム
  amount: number;         // 金額（円）
  category: string;       // カテゴリ（会場費・機材費・飲食費・その他）
  description: string;    // メモ
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  paidBy: string;
  amount: number;
  category: string;
  description: string;
}

export interface ExpenseSummary {
  totalAmount: number;           // 合計金額
  participantCount: number;      // 参加人数
  perPersonAmount: number;       // 一人当たり負担額
  breakdown: {
    userSub: string;
    nickname: string;
    paidAmount: number;          // 立替金額
    balance: number;             // 精算差額（正: 受け取り、負: 支払い）
  }[];
}
```

### 2. API Service Layer

**Endpoints**:
```
GET    /api/events/[eventId]/expenses
POST   /api/events/[eventId]/expenses
PUT    /api/events/[eventId]/expenses/[expenseId]
DELETE /api/events/[eventId]/expenses/[expenseId]
GET    /api/events/[eventId]/expenses/summary
```

**Service**:
```typescript
// src/lib/expense-service.ts

class ExpenseService {
  async getExpenses(eventId: string): Promise<Expense[]>
  async createExpense(eventId: string, data: ExpenseFormData): Promise<Expense>
  async updateExpense(eventId: string, expenseId: string, data: ExpenseFormData): Promise<Expense>
  async deleteExpense(eventId: string, expenseId: string): Promise<void>
  async getSummary(eventId: string): Promise<ExpenseSummary>
}
```

**Response 200 (GET /expenses)**:
```json
{
  "expenses": [
    {
      "id": "uuid",
      "liveEventId": "uuid",
      "paidBy": "user-sub",
      "paidByName": "taro",
      "amount": 5000,
      "category": "会場費",
      "description": "スタジオ代",
      "createdAt": "2026-03-18T00:00:00Z",
      "updatedAt": "2026-03-18T00:00:00Z"
    }
  ]
}
```

**Response 200 (GET /expenses/summary)**:
```json
{
  "totalAmount": 15000,
  "participantCount": 3,
  "perPersonAmount": 5000,
  "breakdown": [
    { "userSub": "sub1", "nickname": "taro", "paidAmount": 10000, "balance": 5000 },
    { "userSub": "sub2", "nickname": "jiro", "paidAmount": 5000, "balance": 0 },
    { "userSub": "sub3", "nickname": "saburo", "paidAmount": 0, "balance": -5000 }
  ]
}
```

### 3. Custom Hooks

```typescript
// src/hooks/useExpenses.ts

export function useExpenses(eventId: string) {
  // 費用一覧の取得・CRUD操作
  return { expenses, isLoading, createExpense, updateExpense, deleteExpense }
}

export function useExpenseSummary(eventId: string) {
  // サマリー（合計・一人当たり負担額）の取得
  return { summary, isLoading }
}
```

### 4. Component Layer

**ページ構成**:
```
src/app/events/[eventId]/expenses/
  └── page.tsx                        # 費用管理ページ

src/components/expenses/
  ├── ExpenseList.tsx                 # 費用一覧テーブル
  ├── ExpenseForm.tsx                 # 費用登録・編集フォーム
  ├── ExpenseFormModal.tsx            # フォームをモーダルでラップ
  └── ExpenseSummary.tsx              # 合計・一人当たり負担額の表示
```

**page.tsx の構成**:
```typescript
// src/app/events/[eventId]/expenses/page.tsx
export default function ExpensesPage({ params }: { params: { eventId: string } }) {
  return (
    <>
      <ExpenseSummary eventId={params.eventId} />
      <ExpenseList eventId={params.eventId} />
      {/* 費用追加ボタン → ExpenseFormModal */}
    </>
  )
}
```

### 5. Database Schema

`prisma/schema.prisma` に追加:
```prisma
model Expense {
  id          String    @id @default(uuid())
  liveEventId String
  paidBy      String    // User.sub
  amount      Int       // 金額（円）
  category    String    @default("その他")
  description String    @default("")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  liveEvent   LiveEvent @relation(fields: [liveEventId], references: [id], onDelete: Cascade)
  paidByUser  User      @relation(fields: [paidBy], references: [sub])
}
```

## Permission Control（必須）

### Permission Constants

```typescript
// src/lib/permissions.ts に追加
export const PERMISSIONS = {
  EXPENSE: {
    VIEW:   'expense:view',
    CREATE: 'expense:create',
    EDIT:   'expense:edit',
    DELETE: 'expense:delete',
  },
}
```

### Implementation Points

- [ ] ページレベルで VIEW 権限チェック
- [ ] 登録ボタンに CREATE 権限チェック
- [ ] 編集ボタンに EDIT 権限チェック（自分の登録のみ編集可も検討）
- [ ] 削除ボタンに DELETE 権限チェック

## Testing Strategy

### Unit Tests

- [ ] ExpenseService: CRUD操作・サマリー計算のテスト
- [ ] useExpenses / useExpenseSummary: データ取得・更新ロジックテスト
- [ ] ExpenseForm: バリデーション・送信テスト
- [ ] ExpenseSummary: 計算結果の表示テスト

### Test Coverage Target

- **Overall**: 80%以上
- **Critical paths（計算ロジック）**: 100%

## Error Handling

- 金額は正の整数のみ許可（バリデーション）
- フィールドレベルのエラー表示
- API エラー時はトースト通知

## Performance Considerations

- **Target**: 初期表示 2秒以内
- 費用一覧は件数が少ないためページネーション不要（初期実装）
