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
  date?: string;          // 開催予定日（未定の場合はnull）
  venue?: string;
  photoAlbumUrl?: string; // Google フォトアルバムURL
  bands: LiveEventBand[]; // Band[] から変更（スナップショット付き中間エンティティ）
  milestones: Milestone[];
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  createdBy: string;      // User.sub
  createdAt: string;
  updatedAt: string;
}

// ライブ×バンドの参加記録（中間エンティティ）
interface LiveEventBand {
  id: string;
  liveEventId: string;
  bandId: string;
  band: Band;                      // 現在のバンド情報（表示用参照）
  memberSnapshot: MemberSnapshot[]; // 参加確定時点のメンバースナップショット
  setlist: Setlist;
  snapshotTakenAt?: string;        // スナップショット取得日時（未確定の場合はnull）
}

// メンバースナップショット（参加確定時点の記録）
interface MemberSnapshot {
  userSub: string;
  nickname: string;                // 当時の表示名も保存
  role: 'leader' | 'member';
}

// マイルストーン
interface Milestone {
  id: string;
  liveEventId: string;
  title: string;
  dueDate?: string;       // 開催予定日が未定の場合はnull
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
  tasks: Task[];
}

// タスク（マイルストーンに紐付く作業単位）
interface Task {
  id: string;
  milestoneId: string;
  liveEventBandId?: string; // nullならライブ全体タスク、あればバンド個別タスク
  title: string;
  assigneeUserSub?: string; // 担当者（User.sub）。未アサインも可
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
}

// セットリスト（LiveEventBand に紐付く）
interface Setlist {
  id: string;
  liveEventBandId: string; // LiveEventBand.id への参照（liveEventId + bandId から変更）
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
| DELETE | /api/bands/:id/members/:userSub | メンバー削除 |

### ライブイベント
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/live-events | ライブ一覧 |
| POST | /api/live-events | ライブ作成（マイルストーン自動生成） |
| GET | /api/live-events/:id | ライブ詳細 |
| PUT | /api/live-events/:id | ライブ更新 |
| GET | /api/live-events/:id/milestones | マイルストーン一覧 |
| PUT | /api/live-events/:id/milestones/:milestoneId | マイルストーン更新 |

### ライブ×バンド参加管理
| Method | Path | 説明 |
|--------|------|------|
| POST | /api/live-events/:id/bands | バンド参加追加（バンド別タスクを自動生成） |
| DELETE | /api/live-events/:id/bands/:liveEventBandId | バンド参加取り消し |
| POST | /api/live-events/:id/bands/:liveEventBandId/snapshot | メンバースナップショット確定 |

### タスク
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/live-events/:id/milestones/:milestoneId/tasks | タスク一覧（?liveEventBandId= でバンド絞り込み可） |
| POST | /api/live-events/:id/milestones/:milestoneId/tasks | タスク追加 |
| PUT | /api/live-events/:id/milestones/:milestoneId/tasks/:taskId | タスク更新（担当者・ステータス変更） |
| DELETE | /api/live-events/:id/milestones/:milestoneId/tasks/:taskId | タスク削除 |

### セットリスト
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/live-events/:id/bands/:liveEventBandId/setlist | セットリスト取得 |
| PUT | /api/live-events/:id/bands/:liveEventBandId/setlist | セットリスト更新 |

### マイルストーン・タスク自動生成ロジック

**ライブ作成時**（`POST /api/live-events`）にマイルストーンとライブ全体タスクを自動生成する。開催予定日が指定されている場合は逆算して期限を設定し、未定の場合は期限を空欄で生成して日程確定後に一括更新できるようにする:

| マイルストーン | 期限（開催日からの逆算） | ライブ全体タスク（例） |
|--------------|----------------------|----------------------|
| バンド参加申し込み締め切り | -60日 | 告知用サイト作成 |
| セットリスト提出締め切り | -30日 | ライブTシャツ手配 |
| リハーサル日程確定 | -21日 | — |
| 会場・機材確認 | -14日 | 会場・機材確認連絡 |
| 最終リハーサル | -7日 | — |
| 当日準備・リハーサル | 0日 | 打ち上げ用デリバリー手配 |

**バンド参加時**（`POST /api/live-events/:id/bands`）にバンド個別タスクを自動生成する:

| 紐付けマイルストーン | バンド個別タスク（例） |
|--------------------|----------------------|
| セットリスト提出締め切り | PA表提出 |
| 最終リハーサル | セットリスト最終確認 |

テンプレートはコードで定義（DBには持たない）。生成後はUIから追加・編集・削除が可能。

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

## Key Decisions（設計判断の記録）

### LiveEventBand スナップショットパターン（2026-03-02）

**課題**: バンドはライブをまたいで存在し続けるが、メンバーは変更される。ライブ開催時点の参加メンバーを記録したい。

**選択肢**:
- A) `LiveEventBand` 中間エンティティ + `MemberSnapshot`（採用）
- B) バンドのバージョニング
- C) スナップショットなし

**決定**: Option A を採用。
- `LiveEventBand` でライブとバンドの参加関係を管理
- `MemberSnapshot` で参加確定時点のメンバー情報（`userSub`, `nickname`, `role`）を保存
- `snapshotTakenAt` が null の間はスナップショット未確定（メンバー変更可能）
- セットリストは `liveEventBandId` に紐付き、ライブ×バンド単位で管理

### タスク設計（2026-03-02）

**課題**: マイルストーンごとに具体的な作業（告知サイト作成、PA表提出など）を管理したい。ライブ全体の作業とバンドごとの作業が混在する。

**決定**:
- `Task` を `Milestone` 配下のエンティティとして定義
- `liveEventBandId` の有無でスコープを判別（null = ライブ全体、あり = バンド個別）
- 担当者（`assigneeUserSub`）をアサイン可能にしてタスクの偏りを防ぐ
- デフォルトタスクはコード定義のテンプレートから自動生成（DBには持たない）
- ライブ全体タスク: ライブ作成時に生成
- バンド個別タスク: バンド参加時（`LiveEventBand` 作成時）に生成
