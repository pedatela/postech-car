variable "aws_region" {
  description = "AWS region used for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Friendly name used to name AWS resources"
  type        = string
  default     = "postech-car"
}

variable "container_image" {
  description = "Full image URI (ECR) used by the ECS task"
  type        = string
  default     = ""
}

variable "container_port" {
  description = "Port exposed by the application container"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS tasks"
  type        = number
  default     = 1
}
