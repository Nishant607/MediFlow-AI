output "instance_id" {
  value = aws_instance.mediflow_server.id
}

output "server_public_ip" {
  value = aws_instance.mediflow_server.public_ip
}
