output "vpc_id" {
  description = "ID of the provisioned Virtual Private Cloud"
  value       = module.vpc.vpc_id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = module.vpc.public_subnet_id
}

output "security_group_id" {
  description = "Security Group ID protecting MediFlow-AI"
  value       = module.security.security_group_id
}

output "server_public_ip" {
  description = "Public IP address of the MediFlow server"
  value       = module.compute.server_public_ip
}

output "app_url" {
  description = "Public web URL to access MediFlow-AI clinical portal"
  value       = "http://${module.compute.server_public_ip}:30080"
}

output "ssh_command" {
  description = "Convenient SSH connection string"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${module.compute.server_public_ip}"
}
