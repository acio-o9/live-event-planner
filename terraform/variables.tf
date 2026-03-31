variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "app_name" {
  description = "Application name (used as prefix for resources)"
  type        = string
  default     = "live-event-planner"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "db_username" {
  description = "Aurora database master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Aurora database master password"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "NextAuth AUTH_SECRET"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth NEXTAUTH_URL (public URL of the app)"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  default     = ""
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "slack_bot_token" {
  description = "Slack Bot Token for login allowlist (users:read.email scope required)"
  type        = string
  sensitive   = true
}

variable "container_cpu" {
  description = "ECS task CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "ECS task memory (MiB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "github_repository" {
  description = "GitHub repository in format 'owner/repo' for OIDC (e.g. 'myorg/live-event-planner')"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}
