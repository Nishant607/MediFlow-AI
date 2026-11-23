# ===================================================================
# MediFlow-AI — Root Infrastructure Orchestration File
# Integrates VPC, Security, and Compute Modules
# ===================================================================

module "vpc" {
  source             = "./modules/vpc"
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  project_name       = var.project_name
  aws_region         = var.aws_region
}

module "security" {
  source       = "./modules/security"
  vpc_id       = module.vpc.vpc_id
  project_name = var.project_name
}

module "compute" {
  source            = "./modules/compute"
  instance_type     = var.instance_type
  subnet_id         = module.vpc.public_subnet_id
  security_group_id = module.security.security_group_id
  key_name          = var.key_name
  project_name      = var.project_name
}
