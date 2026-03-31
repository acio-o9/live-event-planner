# Requirements: Slack Login Allowlist

**Status**: Draft
**Created**: 2026-03-31
**Developer**: maru

## What（何を作るか）

Slackに登録されているメールアドレスによってログイン制限をかける。
Slackワークスペースのメンバーメールアドレスを許可リストとして使用し、
Google OAuthでのログイン時にそのメールアドレスが許可リストに含まれる場合のみアクセスを許可する。

## Why（なぜ必要か）

現在はGoogle accountがあれば誰でもログインできてしまうため、
アクセスをSlackワークスペースのメンバーに限定することでセキュリティを強化したい。

## Requirements（要件）

### Functional Requirements（機能要件）

- [ ] SlackワークスペースのメンバーメールアドレスをSlack APIで取得する
- [ ] ログイン時にGoogle OAuthのメールアドレスが許可リストに含まれるか検証する
- [ ] 許可されていないメールアドレスの場合はアクセス拒否ページを表示する

### Non-Functional Requirements（非機能要件）

- [ ] Slack APIからのメールアドレス取得は1秒以内に完了する
- [ ] テストカバレッジ: 80%以上
- [ ] ローカル環境（NODE_ENV=development）ではSlackメールアドレス検証をスキップする

## Success Criteria（成功基準）

- [ ] 許可リストにあるGoogleアカウントのみログインできる
- [ ] 許可されていないアカウントはアクセス拒否ページに遷移する
- [ ] ローカル環境では検証がスキップされ制限なくログインできる
- [ ] すべてのテストが通過する（80%以上のカバレッジ）
- [ ] コードレビューで承認される
