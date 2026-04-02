# Tasks: Profile Edit

**Status**: Not Started
**Created**: 2026-04-02
**Progress**: 0/28 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `prisma/schema.prisma` に `Instrument` モデルを追加
- [ ] `prisma/schema.prisma` に `UserInstrument` 中間テーブルを追加
- [ ] `User` モデルに `instruments` リレーションを追加
- [ ] `prisma migrate dev` でマイグレーション作成・適用
- [ ] `prisma/seed.ts` に楽器マスタの初期データを追加
- [ ] `lib/types.ts` に `Instrument` 型を追加
- [ ] `lib/types.ts` の `User` 型に `instruments` フィールドを追加
- [ ] `lib/types.ts` に `ProfileUpdateFormData` 型を追加

### Phase 2: API Service Layer

- [ ] `lib/db/serializers.ts` に `serializeInstrument` を追加
- [ ] `lib/db/serializers.ts` の `serializeUser` に `instruments` を追加（include必要）
- [ ] `app/api/instruments/route.ts` を新規作成（GET: 楽器マスタ一覧）
- [ ] `app/api/users/me/route.ts` に PUT ハンドラを追加
  - ニックネームのサーバーサイドバリデーション
  - instrumentIds の存在チェック
  - UserInstrument の差し替え（deleteMany + createMany）
- [ ] `app/api/users/route.ts` を新規作成（GET: メンバー一覧用、instruments 込み）

### Phase 3: Custom Hooks

- [ ] `hooks/useProfile.ts` を新規作成
  - `GET /api/users/me` と `GET /api/instruments` を並列取得
  - `updateProfile(data: ProfileUpdateFormData)` の実装
  - loading / isSaving / error states

### Phase 4: UI Components

- [ ] `components/profile/InstrumentSelector.tsx` を新規作成
  - 楽器マスタからチェックボックスを生成
  - 複数選択対応
- [ ] `components/profile/ProfileEditForm.tsx` を新規作成
  - ニックネーム入力 + リアルタイムバリデーション
  - InstrumentSelector を組み込み
  - 保存ボタン（isSaving 中は disabled）
- [ ] `components/profile/InstrumentFilter.tsx` を新規作成
  - 「すべて」+ 各楽器ボタン
  - クライアントサイドフィルタリング
- [ ] `components/profile/MemberList.tsx` を新規作成
  - ユーザー一覧の表示（担当楽器バッジ付き）
- [ ] `app/profile/page.tsx` を新規作成（AuthGuard + ProfileEditForm）
- [ ] `app/members/page.tsx` を新規作成（AuthGuard + InstrumentFilter + MemberList）
- [ ] Navigation にプロフィール・メンバー一覧へのリンクを追加

### Phase 5: Permission Control

- [ ] `app/profile/page.tsx` を `<AuthGuard>` でラップ
- [ ] `app/members/page.tsx` を `<AuthGuard>` でラップ
- [ ] API PUT `/api/users/me` で `requireSession()` による認証チェック（自分のみ更新可）

### Phase 6: Testing

- [ ] `GET /api/instruments` のテスト
- [ ] `PUT /api/users/me` のテスト（バリデーション・正常系・楽器差し替え）
- [ ] `useProfile` のテスト（fetch・update・error）
- [ ] `ProfileEditForm` のレンダリング・バリデーション表示テスト
- [ ] `InstrumentFilter` のフィルタリング動作テスト
- [ ] 80%以上のカバレッジ確認: `npm test -- profile`

### Phase 7: Documentation & Review

- [ ] `docs/design_docs/20260402-profile-edit/requirements.md` の Status を `Completed` に更新
- [ ] コードレビューと修正
- [ ] レスポンシブ動作確認（モバイル・デスクトップ）

## Progress Tracking

**Overall**: 0% (0/28 tasks)

- Phase 1 (Types & Schema): 0% (0/8)
- Phase 2 (API): 0% (0/5)
- Phase 3 (Hooks): 0% (0/1)
- Phase 4 (UI Components): 0% (0/8)
- Phase 5 (Permission): 0% (0/3)
- Phase 6 (Testing): 0% (0/6)
- Phase 7 (Documentation): 0% (0/2)

## Notes

### Key Decisions

- 担当パートはユーザーと楽器の多対多（`UserInstrument` 中間テーブル）で管理
  - 1ユーザーが複数の楽器を担当できる
- 楽器マスタ（`Instrument`）はシードデータで初期投入、UI での編集は対象外
- `PUT /api/users/me` での楽器更新は deleteMany + createMany のシンプルな差し替え方式
