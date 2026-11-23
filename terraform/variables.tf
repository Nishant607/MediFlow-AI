variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Target deployment environment (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name identifier"
  type        = string
  default     = "mediflow-ai"
}

variable "vpc_cidr" {
  description = "CIDR block for the Virtual Private Cloud"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance size for Kubernetes / Docker host"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "SSH key pair name for instance access"
  type        = string
  default     = "mediflow-key"
}
