# Tasks: Live Notice Tab

**Status**: Not Started
**Created**: 2026-05-07
**Progress**: 0/22 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/types.ts`: `LiveEventDetailTab` に `"notice"` を追加（先頭）
- [ ] `lib/types.ts`: `LiveEvent` に `noticeContent?: string` を追加
- [ ] `lib/types.ts`: `UpdateNoticeRequest` インターフェースを追加

### Phase 2: DB & Serializer

- [ ] `prisma/schema.prisma`: `LiveEvent` に `noticeContent String?` を追加
- [ ] `npx prisma migrate dev --name add_live_event_notice_content` を実行
- [ ] `lib/db/serializers.ts`: `serializeLiveEvent` に `noticeContent` を含める

### Phase 3: API Service Layer

- [ ] `app/api/live-events/[id]/notice/route.ts` を新規作成（PUT のみ）
  - `canManageEvent` による権限チェック
  - `prisma.liveEvent.update` で `noticeContent` を更新
- [ ] `lib/api/live-events.ts`: `updateNotice` メソッドを追加

### Phase 4: UI Components

- [ ] `npm install markdown-it @types/markdown-it` を実行
- [ ] `components/live-events/NoticeTab.tsx` を新規作成
  - 表示モード: markdown-it レンダリング（html: false）
  - 編集モード: textarea + 保存/キャンセルボタン
  - 空状態: 「連絡事項はまだありません」メッセージ
  - `canEdit` が false の場合はクリックイベント無効化
- [ ] `components/live-events/LiveEventDetailTabs.tsx`: TABS配列先頭に `notice` タブを追加
- [ ] `app/live-events/[id]/page.tsx`: `notice` タブのケースを追加し `NoticeTab` を呼び出す

### Phase 5: Permission Control（必須）

- [ ] `app/live-events/[id]/page.tsx`: `canManageEvent` を `canEdit` として `NoticeTab` に渡す
- [ ] APIルート (`notice/route.ts`) で `canManageEvent` による 403 制御を確認
- [ ] 権限なしユーザー（role: "user"）でクリックしても編集モードにならないことを確認

### Phase 6: Testing

- [ ] `app/api/live-events/__tests__/notice.test.ts` を作成
  - PUT 正常ケース（admin, honki_kanrinin）
  - PUT 権限エラーケース（user ロール → 403）
  - PUT 存在しないID → 404
- [ ] `NoticeTab` のコンポーネントテストを作成
  - 表示モードでマークダウンがレンダリングされること
  - `canEdit=true` でクリック → 編集モードに切り替わること
  - `canEdit=false` でクリック → 編集モードにならないこと
  - 保存ボタン → API呼び出し後に表示モードに戻ること

### Phase 7: Documentation & Review

- [ ] CLAUDE.md に変更パターンがあれば更新
- [ ] コードレビューと最終確認
- [ ] レスポンシブ表示の確認（1200px 最小幅）

## Progress Tracking

**Overall**: 0% (0/22 tasks)

- Phase 1 (Types & Interfaces): 0% (0/3)
- Phase 2 (DB & Serializer): 0% (0/3)
- Phase 3 (API Service): 0% (0/2)
- Phase 4 (UI Components): 0% (0/6)
- Phase 5 (Permission Control): 0% (0/3)
- Phase 6 (Testing): 0% (0/3)
- Phase 7 (Documentation): 0% (0/2)

## Development Log

### Session 1: 2026-05-07
**Goal**: Phase 1-2の実装（Types & DB）

**AI Tool**: Claude Code

**Tasks Completed**:
（実装後に記録）

**Next Session**:
- API実装

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions

- `noticeContent` は `LiveEvent` モデルに直接フィールドとして持つ（別テーブルは不要）
- GETは既存の `/api/live-events/[id]` に含める（追加リクエスト不要）
- PUTのみ専用エンドポイント `/api/live-events/[id]/notice` を作成
- markdown-it は `html: false` でXSS対策
- 編集権限: 既存の `canManageEvent`（admin + honki_kanrinin）を流用

### Lessons Learned
（実装後に記録）
