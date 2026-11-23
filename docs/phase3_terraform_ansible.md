# Phase 5 & 6: Infrastructure as Code (Terraform) & Configuration Automation (Ansible)
**Course:** DevOps & Automation Lab (ENSP461) — Capstone Project  
**Application:** MediFlow-AI (Hospital Management System)  
**Total Covered Marks:** 20 Marks (Terraform: 10, Ansible: 10)

---

## 1. Architectural Role in the DevOps Pipeline

```
                                [ Developer / DevOps Engineer ]
                                                │
                                                ▼
                                    [ Step 1: Terraform IaC ]
                                    Provisions Cloud Infrastructure
                                                │
                         ┌──────────────────────┴──────────────────────┐
                         ▼                                             ▼
                 [ AWS VPC Network ]                           [ EC2 Compute Host ]
               (Public Subnet, Gateway)                    (Ubuntu 22.04 LTS, 30GB Disk)
                                                                       │
                                                ┌──────────────────────┘
                                                ▼
                                  [ Step 2: Ansible Automation ]
                                  Configures Operating System & Dependencies
                                                │
                         ┌──────────────────────┼──────────────────────┐
                         ▼                      ▼                      ▼
               [ Docker & Compose ]      [ Kubernetes Tools ]    [ Firewall & UFW ]
                  (Playbook 01)             (Playbook 02)           (Playbook 04)
                                                │
                                                ▼
                                    [ Step 3: Application Run ]
                                     Deploys MediFlow Stack
                                          (Playbook 03)
```

---

## 2. Terraform Infrastructure Overview (`terraform/`)

The infrastructure is designed using a **modular, reusable architecture** containing:

### Module Breakdown:
1. **`modules/vpc`**: Creates the Virtual Private Cloud (VPC), Public Subnet (`10.0.1.0/24`), Internet Gateway, and public Route Table.
2. **`modules/security`**: Configures fine-grained firewall Security Group ingress rules:
   - **Port 22**: SSH remote administration.
   - **Port 80 / 443**: Standard HTTP/HTTPS clinical web traffic.
   - **Port 8000**: Django REST API direct testing.
   - **Port 30080**: Kubernetes NodePort for the MediFlow React UI.
3. **`modules/compute`**: Provisions an AWS EC2 instance (`t3.medium`) with Ubuntu 22.04 LTS and startup user-data script.

### Key Commands for Viva / Lab Demo:
```bash
cd terraform

# 1. Initialize working directory & download AWS provider plugins
terraform init

# 2. Review execution plan (dry-run showing what will be created)
terraform plan

# 3. Apply infrastructure changes
terraform apply -auto-approve

# 4. View outputs (Public IP, App URL, SSH command)
terraform output

# 5. Destroy infrastructure (Zero cloud bill when lab is over)
terraform destroy -auto-approve
```

---

## 3. Ansible Configuration Automation (`ansible/`)

Ansible ensures **idempotent** (safe to run multiple times without unintended side effects) configuration management across the target servers.

### Playbook Inventory:
- **`01-docker-install.yml`**: Automates Docker CE, containerd, and Docker Compose plugin installation, adding the `ubuntu` user to the `docker` group.
- **`02-k8s-install.yml`**: Disables swap memory and installs lightweight Kubernetes runtime (`k3s` / `kubectl`).
- **`03-app-deploy.yml`**: Clones the MediFlow-AI repository and executes `kubectl apply -f k8s/`.
- **`04-system-hardening.yml`**: Applies UFW firewall rules, permitting only essential hospital application ports.

### Execution Commands:
```bash
cd ansible

# Check server connectivity
ansible mediflow_servers -m ping

# Run Docker installation
ansible-playbook playbooks/01-docker-install.yml

# Run Kubernetes installation
ansible-playbook playbooks/02-k8s-install.yml

# Run Application deployment
ansible-playbook playbooks/03-app-deploy.yml

# Run Host security hardening
ansible-playbook playbooks/04-system-hardening.yml
```

---

## 4. Key Viva Questions & Answers for the Examiner

1. **Q: What is the primary difference between Terraform and Ansible?**  
   *Answer:* Terraform is an **Infrastructure as Code (IaC)** tool primarily used for *provisioning* cloud hardware resources (servers, VPCs, subnets, firewalls). Ansible is a **Configuration Management** tool used for *configuring software* inside already-existing servers (installing Docker, copying files, managing services).

2. **Q: What is Idempotency in Ansible?**  
   *Answer:* An idempotent operation can be applied multiple times without changing the result beyond the initial application. If Docker is already installed and running, running `01-docker-install.yml` again will report `ok` rather than reinstalling or causing downtime.

3. **Q: What is the purpose of the `terraform.tfstate` file?**  
   *Answer:* Terraform records the real-world state of provisioned infrastructure in a state file. It uses this state to calculate differences between your `.tf` code and what actually exists in the cloud during `terraform plan`.

---

## 5. Local Validation Suite

To verify all Terraform and Ansible manifests without requiring active cloud credentials:
```bash
python scripts/verify_iac.py
```
Output: `[ALL STAGES PASSED] 100% Terraform & Ansible Files Verified!`
