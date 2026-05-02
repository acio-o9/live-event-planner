# Permission Matrix

Live Event Planner における操作権限の一覧です。
機能追加・変更時はこのドキュメントを更新してください。

**Last Updated**: 2026-05-02

## ロール定義

| ロール | `User.role` 値 | 概要 |
|--------|----------------|------|
| admin | `"admin"` | システム管理者。全操作可能 |
| 本気管理人 | `"honki_kanrinin"` | ライブ企画・運営担当。全イベントを管理・閲覧可能 |
| 一般ユーザー | `"user"` | バンドメンバー等。自分のバンドの操作のみ |

バンドレベルのロールは `EventBandMember.role`（`"leader"` / `"member"`）で管理します。

## 権限マトリックス

| 操作 | admin | 本気管理人 | バンドリーダー（自バンド） | バンドメンバー（自バンド） | その他ユーザー |
|------|:---:|:---:|:---:|:---:|:---:|
| **閲覧（全般）** | ✅ | ✅ | ✅ | ✅ | ✅ |
| ライブイベント作成 | ✅ | ✅ | ❌ | ❌ | ❌ |
| ライブイベント編集・削除 | ✅ | ✅ | ❌ | ❌ | ❌ |
| ステータス変更 | ✅ | ✅ | ❌ | ❌ | ❌ |
| バンド追加（イベントへ） | ✅ | ✅ | ❌ | ❌ | ❌ |
| バンド情報編集・削除 | ✅ | ✅ | ✅ | ❌ | ❌ |
| バンドメンバー追加・削除 | ✅ | ✅ | ✅ | ❌ | ❌ |
| セットリスト編集 | ✅ | ✅ | ✅ | ✅ | ❌ |
| マイルストーン作成・編集・削除 | ✅ | ✅ | ❌ | ❌ | ❌ |
| タスク作成・編集・削除 | ✅ | ✅ | ❌ | ❌ | ❌ |
| タスクステータス更新 | ✅ | ✅ | ✅（担当のみ） | ✅（担当のみ） | ✅（担当のみ） |
| 経費登録 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 経費編集・削除 | ✅ | ✅ | ✅（自分のみ） | ✅（自分のみ） | ❌ |
| スケジュール登録・編集 | ✅ | ✅ | ✅ | ✅ | ❌ |
| User.role 変更（全値） | ✅ | ❌ | ❌ | ❌ | ❌ |
| User.role 変更（honki_kanrinin / user） | ✅ | ✅ | ❌ | ❌ | ❌ |

## 権限チェック関数

実装は [lib/permissions.ts](../lib/permissions.ts) を参照してください。

| 関数 | 用途 |
|------|------|
| `isAdmin(user)` | admin かどうかの判定 |
| `canManageEvent(user)` | admin または honki_kanrinin かどうか |
| `canEditBand(user, bandLeaderUserId)` | バンド情報編集権限 |
| `canEditSetlist(user, bandMemberUserIds)` | セットリスト編集権限 |
| `canUpdateTaskStatus(user, assigneeUserId)` | タスクステータス更新権限 |
| `canChangeUserRole(changer, targetRole)` | ロール変更権限 |
| `canRegisterExpense(user, bandMemberUserIds)` | 経費登録権限 |
| `canEditExpense(user, paidByUserId)` | 経費編集・削除権限 |

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-05-02 | 初版作成。`admin` / `honki_kanrinin` / `user` の3ロール体系を策定 |
