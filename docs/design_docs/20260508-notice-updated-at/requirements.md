# Requirements: Notice Updated At

**Status**: Draft
**Created**: 2026-05-08
**Developer**: maru

## What（何を作るか）

ライブ詳細の連絡事項タブに、連絡事項の最終更新日時を表示する。
`LiveEvent.updatedAt` は使用せず、専用テーブル（`LiveEventNotice`）を新設して更新日時を管理する。
既存の `noticeContent` フィールドも `LiveEvent` から `LiveEventNotice` テーブルへ移行する。

## Why（なぜ必要か）

ユーザーが連絡事項をいつ更新されたか確認できないため、目を通す必要があるか判断できない。
最終更新日時を表示することで、未読の更新があるか一目で判断できるようになる。

## Requirements（要件）

### Functional Requirements（機能要件）

- [ ] 連絡事項タブに最終更新日時を `YYYY/MM/DD HH:mm` 形式で表示する
- [ ] `LiveEvent.noticeContent` は使用せず、`LiveEventNotice` テーブルで連絡事項の内容と更新日時を管理する
- [ ] `LiveEventNotice.updatedAt` は連絡事項が保存されるたびに自動更新される
- [ ] 連絡事項が未登録の場合、更新日時は表示しない（または非表示）
- [ ] 既存の `noticeContent` データを `LiveEventNotice` テーブルへ移行する

### Non-Functional Requirements（非機能要件）

- [ ] 既存の連絡事項タブの表示パフォーマンスに影響を与えない（追加リクエスト不要）
- [ ] DB変更はPrismaマイグレーションで管理し、データ損失なく移行する
- [ ] 日時フォーマットはプロジェクト共通のユーティリティ関数で統一する

## Success Criteria（成功基準）

- [ ] 連絡事項タブに最終更新日時が `YYYY/MM/DD HH:mm` 形式で正しく表示される
- [ ] 連絡事項が未登録の場合、更新日時が表示されない
- [ ] 連絡事項を保存すると更新日時が即座に反映される
- [ ] 既存の連絡事項の表示・編集機能が引き続き正常動作する
- [ ] すべてのテストが通過する
- [ ] コードレビューで承認される
