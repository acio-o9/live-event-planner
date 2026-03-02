# Design: Live Event Planner

**Status**: Draft
**Created**: 2026-03-02

## Architecture（アーキテクチャ）

Next.js 14 App Router を使用したフルスタック構成。

実装する層:
- [x] Types & Interfaces（ドメインモデル型定義）
- [x] API Service Layer（認証・各エンティティCRUD）
- [x] Custom Hooks（状態管理）
- [x] UI Components（ページ・コンポーネント）
- [ ] Permission Control（後日実装予定 - 拡張可能な構造で用意）

## Domain Model（ドメインモデル）

### Types & Interfaces

```typescript
// ユーザー
interface User {
  sub: string;            // OIDCトークンのsubject（個人情報を持たない）
  nickname: string;
  avatarUrl?: string;
  createdAt: string;
}

// バンド
interface Band {
  id: string;
  name: string;
  description?: string;
  members: BandMember[];
  createdAt: string;
  updatedAt: string;
}

interface BandMember {
  userSub: string;        // User.sub への参照
  user: User;
  role: 'leader' | 'member';
  joinedAt: string;
}

// ライブイベント
interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  date: string;           // 開催日
  venue?: string;
  bands: Band[];
  milestones: Milestone[];
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  createdBy: string;      // User.sub
  createdAt: string;
  updatedAt: string;
}

// マイルストーン
interface Milestone {
  id: string;
  liveEventId: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
}

// セットリスト
interface Setlist {
  id: string;
  liveEventId: string;
  bandId: string;
  songs: SetlistSong[];
  updatedAt: string;
}

interface SetlistSong {
  order: number;
  title: string;
  duration?: number;      // 秒数
  note?: string;
}
```

## API Specification（API仕様）

### 認証
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/auth/signin | Google OIDCログイン開始 |
| GET | /api/auth/callback | OIDCコールバック処理 |
| POST | /api/auth/signout | ログアウト |

### ユーザー
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/users/me | 自分のプロフィール取得 |

### バンド
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/bands | バンド一覧 |
| POST | /api/bands | バンド作成 |
| GET | /api/bands/:id | バンド詳細 |
| PUT | /api/bands/:id | バンド更新 |
| POST | /api/bands/:id/members | メンバー追加 |
| DELETE | /api/bands/:id/members/:userId | メンバー削除 |

### ライブイベント
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/live-events | ライブ一覧 |
| POST | /api/live-events | ライブ作成（マイルストーン自動生成） |
| GET | /api/live-events/:id | ライブ詳細 |
| PUT | /api/live-events/:id | ライブ更新 |
| GET | /api/live-events/:id/milestones | マイルストーン一覧 |
| PUT | /api/live-events/:id/milestones/:milestoneId | マイルストーン更新 |

### セットリスト
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/live-events/:id/bands/:bandId/setlist | セットリスト取得 |
| PUT | /api/live-events/:id/bands/:bandId/setlist | セットリスト更新 |

### マイルストーン自動生成ロジック

ライブ作成時（`POST /api/live-events`）に開催日から逆算して以下を自動生成:

| マイルストーン | 期限（開催日からの逆算） |
|--------------|----------------------|
| バンド参加申し込み締め切り | -60日 |
| セットリスト提出締め切り | -30日 |
| リハーサル日程確定 | -21日 |
| 会場・機材確認 | -14日 |
| 最終リハーサル | -7日 |
| 当日準備・リハーサル | 0日 |

## Page / Component Structure（ページ・コンポーネント構成）

```
src/
├── app/
│   ├── page.tsx                                    # ダッシュボード（直近ライブ一覧）
│   ├── auth/
│   │   └── callback/page.tsx                       # OIDCコールバック
│   ├── live-events/
│   │   ├── page.tsx                                # ライブ一覧
│   │   ├── new/page.tsx                            # ライブ作成
│   │   └── [id]/
│   │       ├── page.tsx                            # ライブ詳細・マイルストーン
│   │       └── setlist/page.tsx                    # セットリスト編集
│   └── bands/
│       ├── page.tsx                                # バンド一覧
│       ├── new/page.tsx                            # バンド作成
│       └── [id]/page.tsx                           # バンド詳細・メンバー管理
├── components/
│   ├── live-events/
│   │   ├── LiveEventList.tsx                       # ライブ一覧表示
│   │   ├── LiveEventCard.tsx                       # ライブカード
│   │   ├── LiveEventForm.tsx                       # ライブ作成・編集フォーム
│   │   └── MilestoneList.tsx                       # マイルストーン一覧・進捗
│   ├── bands/
│   │   ├── BandList.tsx                            # バンド一覧表示
│   │   ├── BandCard.tsx                            # バンドカード
│   │   ├── BandForm.tsx                            # バンド作成・編集フォーム
│   │   ├── MemberList.tsx                          # メンバー一覧
│   │   └── SetlistEditor.tsx                       # セットリスト編集UI
│   ├── auth/
│   │   └── AuthGuard.tsx                           # 認証ガード（未認証リダイレクト）
│   └── ui/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── LoadingSpinner.tsx
└── lib/
    ├── types.ts                                    # 全型定義
    ├── auth.ts                                     # OIDC設定（NextAuth.js等）
    └── api/
        ├── bands.ts                                # バンドAPIクライアント
        ├── live-events.ts                          # ライブイベントAPIクライアント
        └── setlists.ts                             # セットリストAPIクライアント
```

## Permission Control（権限制御）

### 現在の実装方針（Phase 1）

認証済みユーザーのみアクセス可能な基本ガード:
- `AuthGuard` コンポーネントで未認証ユーザーをログインページへリダイレクト
- API Routes でセッション確認（未認証は 401 を返す）

### 将来の拡張（Phase 2 以降）

以下の権限コードを将来追加できる構造にしておく:

```typescript
// 将来実装予定の権限コード（現在は使用しない）
type Permission =
  | 'live-event:view'
  | 'live-event:create'
  | 'live-event:edit'
  | 'live-event:delete'
  | 'band:view'
  | 'band:create'
  | 'band:edit'
  | 'band:delete'
  | 'setlist:edit';
```

## Error Handling（エラーハンドリング）

- 認証エラー: ログインページへリダイレクト
- API エラー: トースト通知（バリデーションエラーはフィールド下に表示）
- 404: Not Found ページを表示
- ネットワークエラー: リトライ可能なエラーメッセージを表示

## Testing Strategy（テスト戦略）

- API Service tests: `src/lib/api/__tests__/`
- Component tests: 各コンポーネントの `__tests__/` ディレクトリ
- Integration tests: API Routes のテスト
- カバレッジ目標: 80%以上

## Performance Considerations（パフォーマンス要件）

- 初期ページ表示: 3秒以内
- Next.js の SSR/SSG を適切に活用
- 一覧ページはページネーション対応（20件/ページ）
