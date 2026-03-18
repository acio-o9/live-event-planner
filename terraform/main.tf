terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # リモートステート（S3バックエンド）
  # 初回 terraform init の前に以下のコマンドで S3バケットを作成してください:
  #   aws s3api create-bucket --bucket <YOUR_BUCKET_NAME> --region ap-northeast-1 \
  #     --create-bucket-configuration LocationConstraint=ap-northeast-1
  #   aws s3api put-bucket-versioning --bucket <YOUR_BUCKET_NAME> \
  #     --versioning-configuration Status=Enabled
  # その後 <YOUR_BUCKET_NAME> を実際のバケット名に置き換えて terraform init を実行してください
  backend "s3" {
    bucket = "live-event-planner-tfstate-713090618226"
    key    = "live-event-planner/terraform.tfstate"
    region = "ap-northeast-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.app_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Account ID (ECRのURIなどで使用)
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}
