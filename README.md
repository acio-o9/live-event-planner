# Live Event Planner

社会人サークルで複数バンドが参加するライブイベントを企画・運営するシステム。

## 機能

- Google アカウント（OIDC）でログイン
- バンド作成・メンバー管理
- ライブイベント作成（マイルストーン・タスクを自動生成）
- セットリスト管理（ライブ×バンド単位）
- マイルストーン進捗管理

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repo-url>
cd live-event-planner
npm install
```

### 2. 環境変数を設定

`.env.local.example` をコピーして `.env.local` を作成し、各値を設定する。

```bash
cp .env.local.example .env.local
```

| 変数 | 説明 |
|------|------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console の OAuth クライアント ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console の OAuth クライアントシークレット |
| `AUTH_SECRET` | NextAuth 用シークレット（`openssl rand -base64 32` で生成） |
| `NEXTAUTH_URL` | アプリの URL（ローカル: `http://localhost:3000`） |

### 3. Google OAuth の設定

[Google Cloud Console](https://console.cloud.google.com/) で以下を設定:

1. OAuth 2.0 クライアント ID を作成（アプリケーションの種類: ウェブアプリケーション）
2. 承認済みのリダイレクト URI に `http://localhost:3000/api/auth/callback/google` を追加

### 4. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス可能。

## コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm test` | テスト（watch モード） |
| `npm run test:ci` | テスト（CI モード） |
| `npm run lint` | ESLint 実行 |

## アーキテクチャ

```
app/                    # Next.js App Router ページ・API ルート
├── api/                # API Routes（認証・バンド・ライブ・タスク・セットリスト）
├── bands/              # バンド一覧・作成・詳細ページ
└── live-events/        # ライブ一覧・作成・詳細・セットリストページ
components/             # React コンポーネント
hooks/                  # カスタムフック（useAuth, useBands, useLiveEvents, etc.）
lib/                    # 型定義・APIクライアント・認証設定・テンプレート
```

詳細な設計は [docs/design_docs/20260302-live-event-planner/](docs/design_docs/20260302-live-event-planner/) を参照。