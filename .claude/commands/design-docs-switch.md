# AI駆動開発: 設計書切り替え

複数の設計書がある場合に、作業対象を切り替えます。

## ステップ1: 既存設計書の一覧表示

\`docs/design_docs/\` ディレクトリ内の設計書ディレクトリを検索（Bash tool使用）:

\`\`\`bash
ls -1d docs/design_docs/20*/ 2>/dev/null || echo "設計書が見つかりません"
\`\`\`

設計書が見つからない場合:
\`\`\`
設計書が見つかりません

以下のいずれかを実行してください:
- \`/design-docs:plan\` で新規設計書を作成
- \`/design-docs:quick\` でクイック設計を作成
\`\`\`

## ステップ2: 設計書の詳細情報表示

各設計書ディレクトリの \`requirements.md\` を読み込み、以下を抽出:
- 機能名（Feature Name）
- Status
- Created日付
- What（概要）

一覧形式で表示:
\`\`\`
利用可能な設計書:

1. 20251202-user-management/ (Draft)
   Created: 2025-12-02
   What: ユーザー管理ページの作成

2. 20251201-article-filter/ (In Progress)
   Created: 2025-12-01
   What: 記事一覧ページのフィルター機能追加

3. 20251130-announcement-modal/ (Completed)
   Created: 2025-11-30
   What: お知らせモーダルコンポーネントの実装

現在のカレント設計書: 20251201-article-filter/
\`\`\`

## ステップ3: 設計書の選択

AskUserQuestion toolで選択を促す:

\`\`\`
切り替える設計書を選択してください:

選択肢:
1. 20251202-user-management/
2. 20251201-article-filter/
3. 20251130-announcement-modal/
\`\`\`

ユーザーが選択した設計書のパスを取得。

## ステップ4: カレント設計書の更新

1. \`.claude/.current-design-doc\` ファイルを更新（Write tool使用）:
   \`\`\`
   docs/design_docs/YYYYMMDD-feature-name/
   \`\`\`

2. 更新確認メッセージを表示:
   \`\`\`
   カレント設計書を切り替えました！

   docs/design_docs/YYYYMMDD-feature-name/
     ├── requirements.md
     ├── design.md
     └── tasks.md

   次のステップ:
   - \`/design-docs:start\` で実装開始
   - \`/design-docs:track\` で進捗確認
   \`\`\`

## ステップ5: 進捗状況の簡易表示（オプション）

切り替え後の設計書の \`tasks.md\` を読み込み、進捗状況を簡易表示:

\`\`\`
進捗状況: X% (Y/Z tasks completed)

Status: [Draft/In Progress/Completed]
\`\`\`

## 重要な注意事項

1. **ディレクトリ検索**: \`docs/design_docs/20*/\` パターンで日付プレフィックス付きのみ検索
2. **requirements.md必須**: 各ディレクトリに requirements.md が存在することを確認
3. **カレント設計書管理**: \`.claude/.current-design-doc\` を常に最新に保つ
4. **エラーハンドリング**: 不完全な設計書（ファイル欠損）は警告表示
5. **日付ソート**: 新しい設計書から順に表示（降順）
