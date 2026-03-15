terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # リモートステート（S3バックエンド）
  # 初回 terraform init の前に S3バケットを手動で作成してください
  # backend "s3" {
  #   bucket = "your-tfstate-bucket-name"
  #   key    = "live-event-planner/terraform.tfstate"
  #   region = "ap-northeast-1"
  # }
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
