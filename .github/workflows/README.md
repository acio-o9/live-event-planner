# CI/CD パイプライン セットアップ手順

## GitHub Secrets の設定

| Secret名 | 値 | 取得方法 |
|---------|---|---------|
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-actions-role` | Terraform apply後に確認 |
| `PRIVATE_SUBNET_IDS` | `subnet-xxx,subnet-yyy` | Terraform outputs |
| `ECS_SECURITY_GROUP_ID` | `sg-xxx` | Terraform outputs |

## AWS OIDC プロバイダーの設定（初回のみ）

```bash
# GitHub ActionsのOIDCプロバイダーをAWSに登録
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

GitHub ActionsのOIDC IAMロール（terraform/iam.tfに追加）:

```hcl
resource "aws_iam_role" "github_actions" {
  name = "github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:YOUR_GITHUB_USERNAME/live-event-planner:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_ecr" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

resource "aws_iam_role_policy" "github_actions_ecs" {
  name = "github-actions-ecs-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:RunTask",
          "iam:PassRole"
        ]
        Resource = "*"
      }
    ]
  })
}
```

## デプロイフロー

```
git push origin main
  └─ GitHub Actions
       ├─ テスト (tsc + jest)
       ├─ Docker build & ECR push
       ├─ prisma migrate deploy (ECS一時タスク)
       └─ ECS サービス更新 → ローリングデプロイ
```
