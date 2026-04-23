# RDS PostgreSQL

resource "aws_db_subnet_group" "rds_public" {
  name       = "${var.app_name}-rds-public-subnet-group"
  subnet_ids = aws_subnet.public[*].id
}

resource "aws_db_instance" "rds" {
  identifier        = "${var.app_name}-rds"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "live_event_planner"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds_public.name
  vpc_security_group_ids = [aws_security_group.aurora.id]

  backup_retention_period   = 7
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-rds-final-snapshot"
  deletion_protection       = true
  apply_immediately         = true
  publicly_accessible       = false
}
