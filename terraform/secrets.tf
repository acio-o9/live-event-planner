resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.app_name}/app-secrets"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    DATABASE_URL         = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.rds.address}:5432/live_event_planner"
    AUTH_SECRET          = var.auth_secret
    AUTH_URL             = var.nextauth_url
    NEXTAUTH_URL         = var.nextauth_url
    GOOGLE_CLIENT_ID     = var.google_client_id
    GOOGLE_CLIENT_SECRET = var.google_client_secret
    SLACK_BOT_TOKEN      = var.slack_bot_token
  })
}
