# AI駆動開発: タスク進捗管理 (Next.js Frontend)

設計書のタスク管理と進捗追跡をアシストします。
\`docs/design_docs/templates/tasks_template.md\` に準拠して更新します。

## ステップ1: カレント設計書の確認

\`.claude/.current-design-doc\` ファイルを確認（Read tool使用）:

1. **ファイルが存在しない場合**: エラーメッセージを表示して終了
   \`\`\`
   カレント設計書が設定されていません

   以下のいずれかを実行してください:
   - \`/design-docs:plan\` で新規設計書を作成
   - \`/design-docs:quick\` でクイック設計を作成
   - \`/design-docs:switch\` で既存の設計書を選択
   \`\`\`

2. **gitコミット方式の場合** (\`git:[hash]\` 形式):
   - エラーメッセージを表示して終了
   \`\`\`
   gitコミット方式ではタスク管理は使用できません

   タスク管理が必要な場合:
   - \`/design-docs:plan\` で3ファイル形式の設計書を作成してください
   \`\`\`

3. **3ファイル方式の場合** (ディレクトリパス):
   - 指定されたディレクトリから \`tasks.md\` を読み込み（ステップ2へ）

## ステップ2: tasks.mdの読み込み

カレント設計書ディレクトリから \`tasks.md\` を読み込む（Read tool使用）。
ファイルが存在しない場合はエラーメッセージを表示して終了:

\`\`\`
エラー: tasks.md が見つかりません

[ディレクトリパス]/tasks.md が必要です。
\`\`\`

## ステップ3: 現在の進捗分析

tasks.mdの内容を解析して表示:

1. **チェックボックスをカウント**:
   - \`- [ ]\` = 未完了
   - \`- [x]\` = 完了

2. **Phase別に集計**:
   - 各Phaseのタスク数と完了数

3. **進捗表示**:
\`\`\`
進捗状況

全体: X% (Y/Z tasks completed)

Phase別:
- Phase 1: Types & Interfaces - X% (Y/Z)
- Phase 2: API Service - X% (Y/Z)
- Phase 3: Custom Hooks - X% (Y/Z)
- Phase 4: UI Components - X% (Y/Z)
- Phase 5: Permission Control - X% (Y/Z)
- Phase 6: Testing - X% (Y/Z)
- Phase 7: Documentation - X% (Y/Z)

未完了タスク:
1. [ ] [Phase名] [タスク内容]
2. [ ] [Phase名] [タスク内容]
...

現在進行中:
（進行中タスクがあれば表示）
\`\`\`

## ステップ4: アクション選択

AskUserQuestion toolで以下を質問:

1. **実行するアクション**:
   - 「タスクを開始する」
   - 「タスクを完了にする」
   - 「新しいタスクを追加する」
   - 「開発ログを記録する」
   - 「進捗確認のみ（更新なし）」

**選択に応じた処理:**

### アクション1: タスクを開始する

1. 未完了タスクリストを表示
2. AskUserQuestion toolで開始するタスクを選択
3. Edit toolを使用して tasks.mdの該当タスクを \`- [x]\` に更新（進行中マーク）
4. 「次にやるべきこと」を提案:
   - 関連する実装ファイルのパス
   - 実装すべき内容の要約
   - 参考にすべきコード

### アクション2: タスクを完了にする

1. 進行中・未完了タスクリストを表示
2. AskUserQuestion toolで完了したタスクを選択（複数選択可）
3. Edit toolを使用して tasks.mdの該当タスクを \`- [x]\` に更新
4. Progress Trackingセクションの進捗率を再計算してEdit toolで更新
5. 次の推奨タスクを提案

### アクション3: 新しいタスクを追加する

1. AskUserQuestion toolで以下を質問:
   - 追加するPhase
   - タスク内容
2. Edit toolを使用して tasks.mdの該当Phaseに \`- [ ]\` 形式で追加
3. Progress Trackingの総タスク数を更新

### アクション4: 開発ログを記録する

1. AskUserQuestion toolで以下を質問:
   - セッションの目標（Goal）
   - 完了したタスク（Tasks Completed）
   - 遭遇した問題（Issues Encountered） - オプション
   - 次のセッションの予定（Next Session）
   - 所要時間（Time）
   - AIで節約できた時間（Time Saved with AI） - オプション

2. Edit toolを使用して Development Logセクションに以下形式で追記:

\`\`\`markdown
### Session X: YYYY-MM-DD HH:MM-HH:MM
**Goal**: [ユーザー入力]

**AI Tool**: Claude Code

**Tasks Completed**:
- [x] [タスク1]
- [x] [タスク2]

**Issues Encountered**:
- [問題と解決方法]

**Next Session**:
- [ ] [次のタスク]

**Time**: [X] minutes
**Time Saved with AI**: [Y] minutes

---
\`\`\`

### アクション5: 進捗確認のみ

ステップ3の進捗表示のみ実行し、tasks.mdは更新しない。

## ステップ5: 更新後の確認

tasks.mdを更新した場合:

\`\`\`
tasks.md を更新しました！

更新内容:
- [更新されたタスク一覧]
- 進捗率: X% → Y%

現在の状態:
- 完了: X tasks
- 進行中: Y tasks
- 未着手: Z tasks

次のステップ:
[次に取り組むべきタスクの提案]

推奨:
- Phase完了時は \`npm test -- [feature-name]\` を実行
- 権限制御実装後は権限別テストを実行
- 全Phase完了後は \`npm run lint && npm run build\` を実行
\`\`\`

## ステップ6: 継続的な進捗管理

実装中は定期的に \`/design-docs:track\` を実行することを推奨:
- Phase完了時
- 問題に遭遇した時
- 開発セッション終了時
- テスト実行後

## 重要な注意事項

1. **テンプレート準拠**: \`docs/design_docs/templates/tasks_template.md\` の構造を維持
2. **進捗率の正確性**: チェックボックスの数を正確にカウント
3. **開発ログの記録**: AIとの協働を可視化するため詳細に記録
4. **Blockers管理**: 問題が発生した場合はBlockersセクションに記録
5. **Key Decisions**: 重要な設計判断はNotesセクションに記録
6. **Edit toolの使用**: tasks.md更新時は必ずEdit toolを使用（Read → Edit）
7. **日時取得**: 開発ログ記録時は \`date +"%Y-%m-%d %H:%M"\` で現在時刻を取得
8. **テスト実行**: 各Phase完了時に \`npm test -- [feature-name]\` を実行推奨
9. **AI時間節約**: AIによって節約できた時間を記録し、生産性を可視化
