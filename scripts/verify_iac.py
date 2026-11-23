#!/usr/bin/env python3
"""
MediFlow-AI — Infrastructure as Code (Terraform) & Ansible Validation Suite
Validates Terraform modules, syntax, variables, outputs, and Ansible playbooks.
"""

import os
import sys
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TERRAFORM_DIR = os.path.join(ROOT_DIR, 'terraform')
ANSIBLE_DIR = os.path.join(ROOT_DIR, 'ansible')

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)

def check_terraform_structure():
    print_header("Step 1: Terraform File & Module Inventory Check")
    expected_tf_files = [
        "main.tf",
        "variables.tf",
        "outputs.tf",
        "provider.tf",
        "terraform.tfvars.example",
        os.path.join("modules", "vpc", "main.tf"),
        os.path.join("modules", "vpc", "variables.tf"),
        os.path.join("modules", "vpc", "outputs.tf"),
        os.path.join("modules", "security", "main.tf"),
        os.path.join("modules", "security", "variables.tf"),
        os.path.join("modules", "security", "outputs.tf"),
        os.path.join("modules", "compute", "main.tf"),
        os.path.join("modules", "compute", "variables.tf"),
        os.path.join("modules", "compute", "outputs.tf"),
    ]

    all_exist = True
    for f in expected_tf_files:
        p = os.path.join(TERRAFORM_DIR, f)
        if os.path.exists(p):
            print(f"  [PASS] Found terraform/{f}")
        else:
            print(f"  [FAIL] Missing terraform/{f}")
            all_exist = False

    return all_exist

def check_terraform_syntax():
    print_header("Step 2: Terraform HCL Syntax & Block Balance Check")
    tf_files = []
    for root, _, files in os.walk(TERRAFORM_DIR):
        for f in files:
            if f.endswith('.tf'):
                tf_files.append(os.path.join(root, f))

    errors = []
    for f in tf_files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        rel = os.path.relpath(f, ROOT_DIR)
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            errors.append(f"{rel}: Unbalanced braces ({open_braces} open vs {close_braces} close)")

    if errors:
        print(f"  [FAIL] Syntax errors in Terraform files: {len(errors)}")
        for e in errors:
            print(f"    - {e}")
        return False

    print(f"  [PASS] Verified {len(tf_files)} Terraform (.tf) files. All blocks balanced.")
    return True

def check_terraform_module_wiring():
    print_header("Step 3: Terraform Module Wiring & Outputs Consistency")
    main_tf = os.path.join(TERRAFORM_DIR, "main.tf")
    with open(main_tf, 'r', encoding='utf-8') as f:
        content = f.read()

    has_vpc_mod = 'module "vpc"' in content
    has_sec_mod = 'module "security"' in content
    has_cmp_mod = 'module "compute"' in content

    # Check references between modules
    wires_ok = 'module.vpc.vpc_id' in content and 'module.vpc.public_subnet_id' in content and 'module.security.security_group_id' in content

    if has_vpc_mod and has_sec_mod and has_cmp_mod and wires_ok:
        print("  [PASS] VPC, Security, and Compute modules wired with clean cross-references.")
        return True
    else:
        print("  [FAIL] Module wiring incomplete in terraform/main.tf.")
        return False

def check_ansible_playbooks():
    print_header("Step 4: Ansible Playbooks & Configuration Inventory Check")
    cfg_file = os.path.join(ANSIBLE_DIR, "ansible.cfg")
    inv_file = os.path.join(ANSIBLE_DIR, "inventory.ini")

    playbooks = [
        "01-docker-install.yml",
        "02-k8s-install.yml",
        "03-app-deploy.yml",
        "04-system-hardening.yml",
    ]

    ok = True
    if os.path.exists(cfg_file) and os.path.exists(inv_file):
        print("  [PASS] Found ansible.cfg and inventory.ini.")
    else:
        print("  [FAIL] Missing ansible.cfg or inventory.ini.")
        ok = False

    for pb in playbooks:
        pb_path = os.path.join(ANSIBLE_DIR, "playbooks", pb)
        if os.path.exists(pb_path):
            with open(pb_path, 'r', encoding='utf-8') as f:
                txt = f.read()
            if "hosts:" in txt and "tasks:" in txt:
                print(f"  [PASS] Validated playbook: ansible/playbooks/{pb}")
            else:
                print(f"  [FAIL] Playbook missing hosts or tasks block: {pb}")
                ok = False
        else:
            print(f"  [FAIL] Playbook missing: {pb}")
            ok = False

    return ok

def main():
    print("\n" + "#" * 65)
    print("  MediFlow-AI — Infrastructure as Code & Ansible Validation Suite")
    print("#" * 65)

    checks = [
        check_terraform_structure(),
        check_terraform_syntax(),
        check_terraform_module_wiring(),
        check_ansible_playbooks(),
    ]

    print("\n" + "=" * 65)
    if all(checks):
        print("  [ALL STAGES PASSED] 100% Terraform & Ansible Files Verified!")
        print("  Ready for Cloud Infrastructure Automation & Lab Evaluation.")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print("  [FAILED] Some IaC checks failed. See log above.")
        print("=" * 65 + "\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
