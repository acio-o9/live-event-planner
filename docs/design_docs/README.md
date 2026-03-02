# AI駆動開発: 設計書管理システム

**仕様駆動開発による高品質・高速な機能実装を実現**

## 概要

このシステムは、AI（Claude Code）と協働しながら、仕様駆動で機能開発を進めるためのフレームワークです。
設計書を事前に作成することで、実装の方向性を明確化し、AIとの協働をスムーズにします。

### 主な特徴

- **対話形式の設計書生成**: 質問に答えるだけで詳細設計が完成
- **クイック設計モード**: 2分で設計を完了し、即実装開始
- **進捗管理**: タスク単位で実装状況を可視化
- **AI最適化**: Claude Codeが理解しやすい形式で設計を記録
- **設計書切り替え**: 複数の機能を並行開発可能

## 5つのスラッシュコマンド

\`\`\`bash
# 設計書作成
/design-docs-plan   # 対話形式で詳細設計（requirements/design/tasks）
/design-docs-quick  # gitコミット形式の2分設計

# 実装・進捗管理
/design-docs-start  # カレント設計書から実装開始
/design-docs-track  # タスク進捗管理・Development Log記録
/design-docs-switch # 設計書の切り替え
\`\`\`

## カレント設計書管理

- \`.claude/.current-design-doc\` で作業中の設計書を自動管理
- \`/design-docs-start\` と \`/design-docs-track\` は引数不要
- 設計書は \`docs/design_docs/\` に保存

## 使用方法

### パターン1: 詳細設計（推奨）

大規模機能や複数人での協働開発に最適

\`\`\`bash
# ステップ1: 設計書作成
/design-docs-plan

# 対話形式で以下を入力:
# - What（何を作るか）
# - Why（なぜ必要か）
# - 機能要件
# - 非機能要件
# - 成功基準
# - アーキテクチャレイヤー
# - APIエンドポイント
# - ページ/コンポーネント構成
# - 権限制御

# ステップ2: 実装開始
/design-docs-start

# ステップ3: 進捗管理
/design-docs-track
\`\`\`

**生成される設計書:**
\`\`\`
docs/design_docs/YYYYMMDD-feature-name/
├── requirements.md  # 要件定義
├── design.md        # 詳細設計
└── tasks.md         # タスク管理
\`\`\`

### パターン2: クイック設計

小規模機能や緊急対応に最適

\`\`\`bash
# ステップ1: クイック設計（2分）
/design-docs-quick

# 以下を一括入力:
# - Plan（一行要約）
# - What（概要）
# - Why（理由）
# - How（実装方法）
# - Tests（テスト）

# ステップ2: 実装開始
/design-docs-start

# ステップ3: 実装完了後、コミット更新
git add .
git commit --amend -m "feat: [機能名]

[実装結果のサマリー]
"
\`\`\`

**記録形式:**
- gitの空コミットとして記録
- \`.claude/.current-design-doc\` に \`git:[hash]\` 形式で保存

### パターン3: 設計書の切り替え

複数の機能を並行開発する場合

\`\`\`bash
/design-docs-switch

# 利用可能な設計書一覧から選択
\`\`\`

## 設計書の構成

### requirements.md（要件定義）

- What（何を作るか）
- Why（なぜ必要か）
- Functional Requirements（機能要件）
- Non-Functional Requirements（非機能要件）
- Success Criteria（成功基準）

### design.md（詳細設計）

- Architecture（アーキテクチャレイヤー）
- Implementation（実装詳細）
  - Type Layer（TypeScript型定義）
  - API Service Layer（API呼び出し）
  - Hook Layer（カスタムフック）
  - Component Layer（UIコンポーネント）
- API Specification（API仕様）
- Permission Control（権限制御 - 必須）
- UI/UX Design（デザイン要件）
- Testing Strategy（テスト戦略）
- Error Handling（エラーハンドリング）
- Performance Considerations（パフォーマンス要件）

### tasks.md（タスク管理）

- Task Breakdown（Phase別タスク一覧）
  - Phase 1: Types & Interfaces
  - Phase 2: API Service Layer
  - Phase 3: Custom Hooks
  - Phase 4: UI Components
  - Phase 5: Permission Control（必須）
  - Phase 6: Testing
  - Phase 7: Documentation & Review
- Progress Tracking（進捗率）
- Development Log（開発ログ）
- Blockers（ブロッカー管理）
- Notes（メモ・決定事項）

## Next.js特化の実装フロー

### Phase別実装順序（CRITICAL）

1. **Phase 1: Types & Interfaces**
   - \`src/lib/types.ts\` に型定義
   - API request/response型
   - フォームデータ型

2. **Phase 2: API Service Layer**
   - \`src/lib/[feature]-service.ts\` にサービスクラス
   - CRUD操作の実装
   - エラーハンドリング

3. **Phase 3: Custom Hooks（必要な場合）**
   - \`src/hooks/use[Feature].ts\` にカスタムフック
   - データ取得ロジック
   - フォーム管理ロジック

4. **Phase 4: UI Components**
   - \`src/app/[route]/page.tsx\` にページコンポーネント
   - 一覧・詳細・フォーム画面
   - CLAUDE.mdのデザインシステム準拠

5. **Phase 5: Permission Control（必須）**
   - \`src/lib/permissions.ts\` に権限定数追加
   - Sidebarメニュー項目追加
   - PermissionGuard実装
   - UI要素の権限制御

6. **Phase 6: Testing**
   - API Service tests
   - Component tests
   - Permission tests
   - カバレッジ85%以上

7. **Phase 7: Documentation & Review**
   - CLAUDE.md更新（必要に応じて）
   - docs/sitemap.md更新
   - コードレビュー

### 必須実装項目

#### 権限制御（MANDATORY）

CLAUDE.mdの規定により、すべての新機能には権限制御が必須:

\`\`\`typescript
// 1. 権限定数定義
export const PERMISSIONS = {
  FEATURE: {
    VIEW: 'admin:feature:view',
    CREATE: 'admin:feature:create',
    EDIT: 'admin:feature:edit',
    DELETE: 'admin:feature:delete',
  },
}

// 2. Sidebarメニュー
{
  icon: <Icon className="w-5 h-5" />,
  label: "機能名",
  path: "/feature",
  requiredPermissions: [PERMISSIONS.FEATURE.VIEW],
}

// 3. ページレベルガード
<PermissionGuard requiredPermissions={[PERMISSIONS.FEATURE.VIEW]}>
  {/* コンテンツ */}
</PermissionGuard>

// 4. UI要素の権限制御
const canCreate = hasPermission(PERMISSIONS.FEATURE.CREATE);
{canCreate && <Button>新規作成</Button>}
\`\`\`

#### デザインシステム準拠

CLAUDE.mdの「標準UIパターン」に従う:

- AuthGuard + NavigationSection + PageHeader レイアウト
- SearchAndFilter + DataTable + Pagination
- ValidationError表示（フォームの場合）
- ダークモード対応
- レスポンシブ対応（最小1200px）

#### テストカバレッジ

- Overall: 85%以上
- Critical paths: 100%
- Feature-specific tests: \`npm test -- [feature-name]\`

## まとめ

このシステムにより:

- **設計と実装の分離** - 設計フェーズで方向性を確定
- **AIとの協働最適化** - AIが理解しやすい形式で設計を記録
- **進捗の可視化** - Phase別タスク管理で進捗を明確化
- **品質の担保** - 権限制御・テスト・レビューの標準化
- **知識の蓄積** - 開発ログで経験を記録・共有

**次のステップ:**
1. \`/design-docs-plan\` で設計書を作成
2. \`/design-docs-start\` で実装開始
3. \`/design-docs-track\` で進捗管理
