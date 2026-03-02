# Design: [Feature Name]

**Status**: Draft
**Created**: YYYY-MM-DD
**Developer**: [Developer Name]

## Architecture（アーキテクチャ）

どのレイヤーを変更するか:

UI Layer (Components) → Logic Layer (Hooks/Utils) → API Layer (Services) → Type Layer (Interfaces)
[ ] Components        [ ] Hooks/Utils           [ ] API Services      [ ] Types/Interfaces

## Implementation（実装詳細）

### 1. Type Layer（必要な場合）

**Interface Definition**:
\`\`\`typescript
export interface [FeatureName] {
  id: number;
  // フィールド定義
}

export interface [FeatureName]FormData {
  // フォームデータ定義
}
\`\`\`

### 2. API Service Layer

**Service Interface**:
\`\`\`typescript
class [FeatureName]Service {
  async get[FeatureName]s(params: [FeatureName]ListParams): Promise<PaginatedResponse<[FeatureName]>> {
    // API呼び出し
  }
}
\`\`\`

### 3. Custom Hooks（必要な場合）

**Custom Hooks**:
\`\`\`typescript
export function use[FeatureName]List() {
  // リスト取得ロジック
}
\`\`\`

### 4. Component Layer

**Page Component**:
\`\`\`typescript
// src/app/[route]/page.tsx
export default function [FeatureName]Page() {
  // ページコンポーネント実装
}
\`\`\`

## Permission Control（必須）

### Permission Constants

\`\`\`typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  [FEATURE]: {
    VIEW: 'admin:[feature]:view',
    CREATE: 'admin:[feature]:create',
    EDIT: 'admin:[feature]:edit',
    DELETE: 'admin:[feature]:delete',
  },
}
\`\`\`

### Implementation Points

- [ ] PermissionGuard on page level
- [ ] hasPermission() checks for UI elements
- [ ] Sidebar menu with requiredPermissions
- [ ] Permission-based button visibility

## API Specification

### Endpoint

\`\`\`
GET /api/v7/admin/[resource]
Query Parameters:
  - page: number (optional)
  - per_page: number (optional)
  - search: string (optional)

Response 200:
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 20,
    "total": 200
  }
}
\`\`\`

## Testing Strategy

### Unit Tests

- [ ] API Service: モック応答でのCRUD操作テスト
- [ ] Custom Hooks: データ取得・更新ロジックテスト
- [ ] UI Components: レンダリング・ユーザーイベントテスト

### Test Coverage Target

- **Overall**: 85%以上
- **Critical paths**: 100%

## Error Handling

### Validation Errors

- Field-level error display with `<ValidationError />` component
- Clear errors on user interaction
- Never use toast for validation errors

## Performance Considerations

- **Target**: Initial page load < 2s
- **API Response**: < 500ms (p95)
- **Image Optimization**: Use Next.js Image component
