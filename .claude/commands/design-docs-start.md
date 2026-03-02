# AI駆動開発: 実装指示生成 (Next.js Frontend)

設計書から実装プロンプトを自動生成し、AIに実装指示を出します。

## ステップ1: カレント設計書の読み込み

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
   - \`git show [hash]\` でコミットメッセージを読み込み（Bash tool使用）
   - Plan/What/Why/How/Tests を抽出
   - 簡易的な実装プロンプトを生成（ステップ4-簡易版へ）

3. **3ファイル方式の場合** (ディレクトリパス):
   - 指定されたディレクトリから3ファイルを読み込み（ステップ2へ）

## ステップ2: 設計書の読み込み（3ファイル方式）

カレント設計書ディレクトリから以下を読み込み（Read tool使用）:
1. \`requirements.md\` - 機能要件と成功基準
2. \`design.md\` - アーキテクチャと実装詳細
3. \`tasks.md\` - タスク一覧と進捗

ファイルが存在しない場合はエラーメッセージを表示して終了:
\`\`\`
エラー: 設計書ファイルが見つかりません

[ディレクトリパス] に以下のファイルが必要です:
- requirements.md
- design.md
- tasks.md
\`\`\`

## ステップ3: コンテキスト抽出

各ファイルから必要な情報を抽出:

**requirements.mdから:**
- What（何を作るか）
- Why（なぜ必要か）
- Functional Requirements（機能要件）
- Non-Functional Requirements（非機能要件）
- Success Criteria（成功基準）

**design.mdから:**
- Architecture（どの層を変更するか）
- Implementation詳細（各層の型定義・インターフェース）
- API Specification（エンドポイント仕様）
- Permission Control（権限制御）
- UI/UX Design（デザイン要件）
- Testing Strategy（テスト戦略）
- Error Handling（エラーハンドリング）
- Performance Considerations（パフォーマンス要件）

**tasks.mdから:**
- Task Breakdown（Phase別タスク一覧）
- 現在の進捗状況

## ステップ4: 実装プロンプト生成

抽出した情報をもとに、Next.js/Reactアーキテクチャに準拠した実装指示を生成:

\`\`\`
以下の設計書に従って実装してください。

# 機能概要

## What（何を作るか）
[requirements.mdのWhatセクション]

## Why（なぜ必要か）
[requirements.mdのWhyセクション]

# アーキテクチャ

[design.mdのArchitectureセクションを引用]

実装する層:
[✓がついている層をリストアップ]

# 実装タスク（Phase別）

[tasks.mdのTask Breakdownを引用し、優先順位順に整理]

## Phase 1: Types & Interfaces
[Type層のタスクをリストアップ]

実装ファイル: \`src/lib/types.ts\`
[design.mdのInterface定義を含める]

## Phase 2: API Service Layer
[API Service層のタスクをリストアップ]

実装ファイル: \`src/lib/[feature]-service.ts\`
[design.mdのService Interface定義を含める]

## Phase 3: Custom Hooks
[Hook層のタスクをリストアップ - 必要な場合]

実装ファイル: \`src/hooks/use[Feature].ts\`

## Phase 4: UI Components
[Component層のタスクをリストアップ]

実装ファイル:
- Page: \`src/app/[route]/page.tsx\`
- Components: \`src/components/[feature]/\`

デザインシステム準拠:
- CLAUDE.mdの「標準UIパターン」に従う
- AuthGuard + NavigationSection + PageHeader レイアウト
- 検索・フィルター・テーブル・ページネーション
- ValidationError表示（フォームの場合）
- ダークモード対応

## Phase 5: Permission Control（必須）
[権限制御のタスクをリストアップ]

実装ステップ:
1. \`src/lib/permissions.ts\` に権限定数追加
2. \`src/components/ui/Sidebar.tsx\` にメニュー項目追加
3. ページに \`PermissionGuard\` 実装
4. UI要素に権限チェック実装
5. 権限別テスト実装

## Phase 6: Testing
[テストのタスクをリストアップ]

テスト実装:
- API Service tests: \`src/lib/__tests__/[feature]-service.test.ts\`
- Component tests: \`src/app/[route]/__tests__/page.test.tsx\`
- Permission tests: 異なる権限レベルでのテスト

実行コマンド: \`npm test -- [feature-name]\`

## Phase 7: Documentation & Review
[ドキュメント・レビューのタスクをリストアップ]

# API仕様

[design.mdのAPI Specificationセクションを完全引用]

# 権限制御

[design.mdのPermission Controlセクションを引用]

実装必須項目:
- 権限定数定義
- Sidebarメニュー権限
- ページレベルガード
- UI要素の権限制御
- 権限テスト

# UI/UX要件

[design.mdのUI/UX Designセクションを引用]

CLAUDE.md準拠:
- カラーパレット統一
- タイポグラフィ統一
- レスポンシブ対応（最小1200px）
- ダークモード完全対応

# テスト戦略

[design.mdのTesting Strategyセクションを引用]

## テストケース
- Unit tests: [具体的なテストケース]
- Integration tests: [具体的なシナリオ]
- Permission tests: [権限別シナリオ]

カバレッジ目標: 85%以上

# エラーハンドリング

[design.mdのError Handlingセクションを引用]

重要: バリデーションエラーは必ずフィールド下に表示（toast禁止）

# 成功基準

[requirements.mdのSuccess Criteriaを引用]

# 制約事項

- Next.js 14 App Router準拠
- CLAUDE.mdのコーディング規約に従う
- テストカバレッジ85%以上
- パフォーマンス要件: [design.mdから抽出]
- 権限制御必須実装
- レスポンシブ対応（最小1200px）
- ダークモード完全対応

# 実装の進め方

1. TodoWrite toolを使用してタスク管理開始
2. Phase順に実装（Types → API → Hooks → Components → Permissions → Testing）
3. 各Phase完了後、TodoWriteでタスクをcompletedに更新
4. 実装完了後、\`npm test -- [feature-name]\` を実行
5. \`/design-docs:track\` で進捗を記録

それでは実装を開始してください。
\`\`\`

**gitコミット方式の簡易版プロンプト:**
\`\`\`
以下の設計に従って実装してください。

# 機能: [Plan]

## What（何を作るか）
[What]

## Why（なぜ必要か）
[Why]

## 実装方法（How）
[Howの箇条書き]

## テストケース
[Testsのチェックリスト]

# 制約事項

- Next.js 14 App Router準拠
- CLAUDE.mdのコーディング規約に従う
- テストカバレッジ85%以上
- 権限制御必須実装（新ページの場合）

それでは実装を開始してください。
\`\`\`

## ステップ5: 実装開始確認

生成したプロンプトを表示し、実装を開始:

**3ファイル方式の場合:**
\`\`\`
設計書を読み込みました！

[設計書ディレクトリパス]
  ├── requirements.md ✓
  ├── design.md ✓
  └── tasks.md ✓

実装プロンプトを生成しました。
上記の指示に従って実装を開始します。

進捗管理:
- TodoWrite toolでタスクを管理します
- 実装完了後は \`/design-docs:track\` で進捗を記録してください
\`\`\`

**gitコミット方式の場合:**
\`\`\`
設計コミットを読み込みました！

git:[hash]

実装プロンプトを生成しました。
上記の指示に従って実装を開始します。

実装完了後:
git add .
git commit --amend -m "feat: [機能名]

[実装結果のサマリー]
"
\`\`\`

その後、ステップ4で生成したプロンプトに従って実装を開始。

## 重要な注意事項

1. **設計書の完全性**: 3ファイルすべてが存在することを確認
2. **TodoWrite tool連携**: 実装中のタスク管理を自動化
3. **CLAUDE.md準拠**: 必ず既存のデザインシステムに従う
4. **権限制御必須**: 新しいページ/機能には必ず権限制御を実装
5. **テスト駆動**: テストを書いてから実装
6. **進捗記録**: 各Phase完了後に \`/design-docs:track\` で記録
7. **gitコミット方式対応**: \`git:\` プレフィックスで判別し、git show コマンドで読み込み
8. **フィーチャー特化テスト**: \`npm test -- [feature-name]\` で特定機能のみテスト実行
