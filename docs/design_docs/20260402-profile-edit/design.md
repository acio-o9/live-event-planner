# Design: Profile Edit

**Status**: Draft
**Created**: 2026-04-02
**Developer**: maru

## Architecture（アーキテクチャ）

UI Layer (Components) → Logic Layer (Hooks) → API Layer → Type Layer (Interfaces)
[x] Components        [x] Hooks              [x] API       [x] Types/Interfaces

## Implementation（実装詳細）

### 1. Type Layer

**Prisma Schema 変更** (`prisma/schema.prisma`):

```prisma
model Instrument {
  id      String           @id @default(uuid())
  name    String           @unique  // "ギター", "ベース" など
  order   Int              @default(0)
  users   UserInstrument[]
}

model UserInstrument {
  userSub      String
  instrumentId String

  user       User       @relation(fields: [userSub], references: [sub], onDelete: Cascade)
  instrument Instrument @relation(fields: [instrumentId], references: [id], onDelete: Cascade)

  @@id([userSub, instrumentId])
}

// User モデルに追加
model User {
  sub         String           @id
  nickname    String
  avatarUrl   String?
  createdAt   DateTime         @default(now())

  instruments     UserInstrument[]
  // ... 既存リレーション
}
```

**TypeScript 型定義** (`lib/types.ts`):

```typescript
export interface Instrument {
  id: string;
  name: string;
  order: number;
}

// User interface に instruments を追加
export interface User {
  sub: string;
  nickname: string;
  avatarUrl?: string;
  instruments: Instrument[];  // 追加
  createdAt: string;
}

export interface ProfileUpdateFormData {
  nickname: string;
  instrumentIds: string[];
}
```

### 2. API Layer

**エンドポイント一覧**:

| Method | Path | 概要 |
|--------|------|------|
| GET | `/api/instruments` | 楽器マスタ一覧取得 |
| GET | `/api/users/me` | 自分のプロフィール取得（instruments 含む） |
| PUT | `/api/users/me` | ニックネーム・担当楽器を更新 |
| GET | `/api/users` | 全ユーザー一覧取得（メンバー一覧用） |

**PUT /api/users/me** リクエスト/レスポンス:

```
Request Body:
{
  "nickname": string,        // 必須
  "instrumentIds": string[]  // 楽器IDの配列（空配列も可）
}

Response 200: User（instruments 込み）
Response 400: { "error": string }
Response 401: { "error": "Unauthorized" }
```

PUT の実装は楽器の差分を upsert/deleteMany で管理:

```typescript
// UserInstrument を全削除して再作成（シンプルな実装）
await prisma.$transaction([
  prisma.userInstrument.deleteMany({ where: { userSub: sub } }),
  prisma.userInstrument.createMany({
    data: instrumentIds.map((id) => ({ userSub: sub, instrumentId: id })),
  }),
  prisma.user.update({ where: { sub }, data: { nickname } }),
]);
```

**GET /api/instruments** (`app/api/instruments/route.ts`):

```typescript
export async function GET() {
  const instruments = await prisma.instrument.findMany({
    orderBy: { order: 'asc' },
  });
  return Response.json(instruments);
}
```

**serializers.ts 更新** (`lib/db/serializers.ts`):
- `serializeUser` に `instruments` フィールドを追加
- `serializeInstrument` を新規追加

### 3. Custom Hooks

**`hooks/useProfile.ts`**:

```typescript
export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);  // マスタ
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET /api/users/me と GET /api/instruments を並列取得
  const fetchProfile = async () => { ... };

  // PUT /api/users/me でプロフィール更新
  const updateProfile = async (data: ProfileUpdateFormData): Promise<boolean> => { ... };

  return { profile, instruments, isLoading, isSaving, error, updateProfile };
}
```

### 4. Component Layer

**ページ/コンポーネント構成**:

```
app/
  profile/
    page.tsx              # プロフィール編集ページ
  members/
    page.tsx              # メンバー一覧ページ（楽器フィルター付き）

components/
  profile/
    ProfileEditForm.tsx   # ニックネーム・担当楽器編集フォーム
    InstrumentSelector.tsx # 楽器選択（チェックボックス群）
    MemberList.tsx        # メンバー一覧
    InstrumentFilter.tsx  # 楽器フィルタータブ/ボタン
```

**`components/profile/InstrumentSelector.tsx`**:
- 楽器マスタからチェックボックスを生成
- 複数選択可能
- 現在の選択状態を props で受け取り、変更を親に通知

**`components/profile/InstrumentFilter.tsx`**:
- 「すべて」+ 各楽器のボタン
- useState でクライアントサイドフィルタリング
- ページネーションなし（全件表示）

## Permission Control（権限制御）

ロールベース権限は不要。ログイン認証のみ。

- **ページレベル**: `<AuthGuard>` でラップ
- **APIレベル**: `requireSession()` で認証チェック、自分の `sub` のデータのみ更新可能

## Validation Rules

### ニックネーム
- 必須（空文字不可）
- 保存前に前後の空白をトリム
- 全角換算10文字以内（全角1文字=1、半角1文字=0.5でカウント）
- 制御文字・改行は不可

### 担当楽器
- 任意（空配列可）
- 値は `instruments` マスタの ID のみ許可（サーバーサイドで検証）

## DB Migration

```sql
-- 楽器マスタの初期データ投入（seed）
INSERT INTO "Instrument" (id, name, "order") VALUES
  (uuid(), 'ボーカル', 1),
  (uuid(), 'ギター', 2),
  (uuid(), 'ベース', 3),
  (uuid(), 'ドラム', 4),
  (uuid(), 'キーボード', 5),
  (uuid(), '管楽器', 6),
  (uuid(), '弦楽器', 7),
  (uuid(), 'その他', 8);
```

## Testing Strategy

### Unit Tests

- [ ] PUT /api/users/me: バリデーション（空文字・文字数超過・不正なinstrumentId）
- [ ] PUT /api/users/me: 正常更新（楽器の追加・削除・差し替え）
- [ ] GET /api/instruments: 一覧取得
- [ ] useProfile: fetchProfile・updateProfile のモックテスト
- [ ] ProfileEditForm: バリデーション表示・送信動作
- [ ] InstrumentFilter: フィルタリング動作

### Test Coverage Target

- **Overall**: 80%以上
- **API routes**: 100%

## Performance Considerations

- **Target**: 初期表示 < 2s
- プロフィール取得と楽器マスタ取得は `Promise.all` で並列実行
- メンバー一覧フィルタリングはクライアントサイドで追加 API コールなし
