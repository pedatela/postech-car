output "cluster_id" {
  value       = aws_ecs_cluster.this.id
  description = "ECS cluster ID"
}

output "service_name" {
  value       = aws_ecs_service.app.name
  description = "ECS service name"
}

output "load_balancer_dns" {
  value       = aws_lb.app.dns_name
  description = "Public DNS of the ALB"
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "ECR repository URL"
}
