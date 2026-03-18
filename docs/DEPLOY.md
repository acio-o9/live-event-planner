# AWS デプロイ手順書

## 前提条件

- Node.js 20+
- Docker Desktop（インストール済み・起動中）
- Terraform 1.5+
- AWS CLI v2
- Git / GitHub アカウント

---

## Phase 1: AWS CLI セットアップ

### 1-1. AWS CLI インストール（未インストールの場合）

```bash
# Windows (winget)
winget install Amazon.AWSCLI

# インストール確認
aws --version
```

### 1-2. IAM ユーザーまたは SSO の設定

**オプション A: IAM ユーザー（アクセスキー方式）**

1. AWS コンソール → IAM → ユーザー → アクセスキーを作成
2. 必要なポリシーをアタッチ:
   - `AdministratorAccess`（初回セットアップ用、後で絞り込み推奨）
3. 認証情報を設定:

```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: ap-northeast-1
# Default output format: json
```

**動作確認:**

```bash
aws sts get-caller-identity
```

---

## Phase 2: Google OAuth セットアップ

1. [Google Cloud Console](https://console.cloud.google.com/) → 新規プロジェクト作成（または既存）
2. API とサービス → 認証情報 → OAuth 2.0 クライアント ID を作成
3. アプリケーションの種類: **ウェブアプリケーション**
4. 承認済みリダイレクト URI に以下を追加:
   - `http://localhost:3000/api/auth/callback/google`（開発用）
   - `http://<ALB_DNS_NAME>/api/auth/callback/google`（本番用 — terraform apply後に追加）
5. クライアント ID とシークレットをメモしておく

---

## Phase 3: Terraform 変数ファイルの準備

```bash
cd terraform

# terraform.tfvars.example をコピーして実際の値を設定
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` を編集して以下を設定:

| 変数 | 値 | 備考 |
|------|----|------|
| `db_password` | 強力なパスワード | 英数字+記号16文字以上推奨 |
| `auth_secret` | ランダム文字列 | `openssl rand -base64 32` で生成 |
| `nextauth_url` | `http://CHANGE_ME_alb_dns_name` | 初回 apply 後に更新 |
| `google_client_id` | Google OAuth クライアント ID | Phase 2 で取得 |
| `google_client_secret` | Google OAuth シークレット | Phase 2 で取得 |
| `github_repository` | `owner/repo` 形式 | 例: `myname/live-event-planner` |

---

## Phase 4: Terraform による AWS インフラ構築

### 4-1. S3 バックエンド用バケットを作成（手動）

```bash
# バケット名は全世界でユニークである必要があります
BUCKET_NAME="live-event-planner-tfstate-$(aws sts get-caller-identity --query Account --output text)"

aws s3api create-bucket \
  --bucket $BUCKET_NAME \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

echo "バケット名: $BUCKET_NAME"
```

### 4-2. Terraform バックエンドのバケット名を更新

`terraform/main.tf` の `backend "s3"` ブロックの `bucket` を上記バケット名に変更:

```hcl
backend "s3" {
  bucket = "live-event-planner-tfstate-123456789012"  # ← 実際のバケット名
  key    = "live-event-planner/terraform.tfstate"
  region = "ap-northeast-1"
}
```

### 4-3. Terraform 実行

```bash
cd terraform

# 初期化
terraform init

# 変更内容の確認
terraform plan

# インフラ構築（Aurora起動まで10〜15分かかります）
terraform apply
```

apply 完了後、以下の出力値をメモ:

```bash
terraform output ecr_repository_url    # ECR URL
terraform output alb_dns_name          # ALB DNS 名
terraform output github_actions_role_arn  # GitHub Actions IAM ロール ARN
```

### 4-4. nextauth_url を更新して再 apply

`terraform.tfvars` の `nextauth_url` を ALB DNS 名に更新:

```hcl
nextauth_url = "http://live-event-planner-alb-xxxxxxxxx.ap-northeast-1.elb.amazonaws.com"
```

```bash
terraform apply
```

---

## Phase 5: GitHub Actions Secrets の登録

GitHub リポジトリ → Settings → Secrets and variables → Actions → New repository secret

| Secret名 | 値 |
|----------|----|
| `AWS_ROLE_ARN` | `terraform output github_actions_role_arn` の値 |
| `PRIVATE_SUBNET_IDS` | プライベートサブネットID（カンマ区切り）|
| `ECS_SECURITY_GROUP_ID` | ECS セキュリティグループID |

サブネットID と SG ID の取得:

```bash
# プライベートサブネット ID（カンマ区切りで使用）
aws ec2 describe-subnets \
  --filters "Name=tag:Name,Values=live-event-planner-private-*" \
  --query 'Subnets[*].SubnetId' \
  --output text | tr '\t' ','

# ECS セキュリティグループ ID
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=live-event-planner-ecs-sg" \
  --query 'SecurityGroups[0].GroupId' \
  --output text
```

---

## Phase 6: 初回 Docker イメージのビルドと Push

```bash
# ECR にログイン
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-1.amazonaws.com"

aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# ビルド & プッシュ
cd ..  # プロジェクトルートに戻る
docker build -t live-event-planner .
docker tag live-event-planner:latest $ECR_URL/live-event-planner:latest
docker push $ECR_URL/live-event-planner:latest
```

---

## Phase 7: Prisma マイグレーション実行

ECS 上で一時タスクとしてマイグレーションを実行:

```bash
# 必要な値を取得
CLUSTER="live-event-planner"
TASK_DEF="live-event-planner"
PRIVATE_SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters "Name=tag:Name,Values=live-event-planner-private-*" \
  --query 'Subnets[*].SubnetId' --output text | tr '\t' ',')
ECS_SG=$(aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=live-event-planner-ecs-sg" \
  --query 'SecurityGroups[0].GroupId' --output text)

aws ecs run-task \
  --cluster $CLUSTER \
  --task-definition $TASK_DEF \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"live-event-planner","command":["npx","prisma","migrate","deploy"]}]}'
```

---

## Phase 8: ECS サービスを最初のイメージで起動

```bash
aws ecs update-service \
  --cluster live-event-planner \
  --service live-event-planner \
  --force-new-deployment
```

---

## Phase 9: 動作確認

### ヘルスチェック

```bash
ALB_DNS=$(terraform -chdir=terraform output -raw alb_dns_name)
curl http://$ALB_DNS/api/health
# 期待値: {"status":"ok"}
```

### ECS ログ確認

```bash
aws logs tail /ecs/live-event-planner --follow
```

### ブラウザでアクセス

```
http://<ALB_DNS_NAME>
```

---

## Phase 10: GitHub Actions による継続的デプロイ

以降は `main` ブランチへの push で自動デプロイされます。

```bash
git push origin main
```

GitHub Actions の進捗は:
リポジトリ → Actions タブで確認できます。

---

---

## 本番環境への移行手順

現在の構成は検証・デモ用にコストを最適化しています。本番運用前に以下を変更してください。

### 1. NAT Gateway を復活させる

`terraform/vpc.tf` の NAT Gateway リソースを追加:

```hcl
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "${var.app_name}-nat-eip" }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = { Name = "${var.app_name}-nat" }
}
```

`aws_route_table "private"` にルートを追加:

```hcl
route {
  cidr_block     = "0.0.0.0/0"
  nat_gateway_id = aws_nat_gateway.main.id
}
```

### 2. ECS をプライベートサブネットに戻す

`terraform/ecs.tf` の `network_configuration` を変更:

```hcl
network_configuration {
  subnets          = aws_subnet.private[*].id
  security_groups  = [aws_security_group.ecs.id]
  assign_public_ip = false
}
```

### 3. Fargate Spot をやめる

`terraform/ecs.tf` の `capacity_provider_strategy` ブロックを削除し、代わりに:

```hcl
launch_type = "FARGATE"
```

### 4. Aurora の最小 ACU を上げる

`terraform/rds.tf`:

```hcl
serverlessv2_scaling_configuration {
  min_capacity = 0.5
  max_capacity = 4
}
```

### 5. HTTPS を有効化

`terraform/alb.tf` の HTTPS リスナーのコメントを外し、ACM 証明書 ARN を設定する。

### 6. 変更を適用

```bash
cd terraform
terraform plan
terraform apply
```

---

## トラブルシューティング

### ECS タスクが起動しない

```bash
aws ecs describe-services \
  --cluster live-event-planner \
  --services live-event-planner \
  --query 'services[0].events[:5]'
```

### Aurora に接続できない

- ECS セキュリティグループが Aurora SG への port 5432 を許可しているか確認
- `DATABASE_URL` が Secrets Manager に正しく設定されているか確認

### マイグレーションが失敗する

```bash
aws logs filter-log-events \
  --log-group-name /ecs/live-event-planner \
  --filter-pattern "prisma"
```
