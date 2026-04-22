# Tasks: Band Leader Change

**Status**: Not Started
**Created**: 2026-04-22
**Progress**: 0/14 tasks completed

## Task Breakdown

### Phase 1: Types & Interfaces

- [ ] `lib/types.ts` に `UpdateBandLeaderRequest` インターフェースを追加

### Phase 2: API Route Layer

- [ ] `app/api/live-events/[id]/bands/[liveEventBandId]/leader/route.ts` を新規作成
- [ ] `PUT` ハンドラで認証・バンド存在確認・メンバー存在確認を実装
- [ ] Prisma トランザクションで旧リーダー降格 → 新リーダー昇格を原子的に処理
- [ ] 更新後の `EventBand` を返却

### Phase 3: API Service Layer

- [ ] `lib/api/live-events.ts` に `changeLeader()` メソッドを追加

### Phase 4: UI Components

- [ ] `components/live-events/BandMembersModal.tsx` の「リーダー」ラベルを「バンドマスター」に変更
- [ ] `handleChangeLeader()` ハンドラを追加
- [ ] 非バンドマスターメンバー行に「バンドマスターに変更」ボタンを追加

### Phase 5: Permission Control

- [ ] 既存の `requireSession()` で十分であることを確認（追加権限制御なし）

### Phase 6: Testing

- [ ] API route の正常系テストを追加（バンドマスター変更・旧リーダーが member になる）
- [ ] API route の異常系テストを追加（バンド不存在・メンバー不存在）
- [ ] Component テストで「バンドマスター」ラベル表示を確認
- [ ] Component テストで「バンドマスターに変更」ボタンのクリックイベントを確認

### Phase 7: Documentation & Review

- [ ] コードレビューと動作確認（モーダル上でリーダー変更の一連フローを手動テスト）

## Progress Tracking

**Overall**: 0% (0/14 tasks)

- Phase 1 (Types): 0% (0/1)
- Phase 2 (API Route): 0% (0/4)
- Phase 3 (API Service): 0% (0/1)
- Phase 4 (UI Components): 0% (0/3)
- Phase 5 (Permission): 0% (0/1)
- Phase 6 (Testing): 0% (0/4)
- Phase 7 (Review): 0% (0/1)

## Development Log

### Session 1: 2026-04-22
**Goal**: 設計書作成

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] requirements.md / design.md / tasks.md 生成

**Next Session**:
- [ ] Phase 1〜4 の実装

---

## Blockers

### Active Blockers
None currently

### Resolved Blockers
（なし）

## Notes

### Key Decisions
- バンドマスター変更は Prisma `$transaction` で原子的に処理する（整合性保証）
- 権限制御は既存の `requireSession()` のみ（メンバー追加・削除と同等）
- Custom Hooks は不要（シンプルな1アクション操作）
- 「リーダー」→「バンドマスター」の表示変更は `BandMembersModal.tsx` のみが対象（他ファイルに "リーダー" 文字列なし）
