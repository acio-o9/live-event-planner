# Aurora Serverless v2 (PostgreSQL互換)

resource "aws_db_subnet_group" "aurora" {
  name       = "${var.app_name}-aurora-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier     = "${var.app_name}-aurora"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned"
  engine_version         = "15.8"
  database_name          = "live_event_planner"
  master_username        = var.db_username
  master_password        = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.aurora.id]
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.app_name}-final-snapshot"
  deletion_protection    = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 4
  }
}

resource "aws_rds_cluster_instance" "aurora" {
  identifier         = "${var.app_name}-aurora-instance-1"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}
