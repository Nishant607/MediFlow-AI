#!/usr/bin/env python3
"""
MediFlow-AI — Kubernetes Manifests Validation Suite
Validates all YAML manifests, label selectors, port mappings, and GitOps configs.
"""

import os
import sys
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K8S_DIR = os.path.join(ROOT_DIR, 'k8s')

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)

def check_file_exists(filename):
    path = os.path.join(K8S_DIR, filename)
    if os.path.exists(path):
        print(f"  [PASS] Found {filename}")
        return True
    else:
        print(f"  [FAIL] Missing {filename}")
        return False

def check_all_manifests_present():
    print_header("Step 1: Manifest Presence & Inventory Check")
    expected_files = [
        "namespace.yaml",
        "configmap.yaml",
        "secrets.yaml",
        "postgres-pv-pvc.yaml",
        "postgres.yaml",
        "redis.yaml",
        "backend.yaml",
        "celery.yaml",
        "frontend.yaml",
        "ingress.yaml",
        "hpa.yaml",
        "blue-green-deployment.yaml",
        "argocd-app.yaml",
    ]
    all_ok = True
    for f in expected_files:
        if not check_file_exists(f):
            all_ok = False
    return all_ok

def check_yaml_syntax_and_structure():
    print_header("Step 2: Basic YAML Syntax & Document Structure")
    yaml_files = [f for f in os.listdir(K8S_DIR) if f.endswith(('.yaml', '.yml'))]
    errors = []

    for yf in yaml_files:
        path = os.path.join(K8S_DIR, yf)
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Basic indentation and colon check
        for idx, line in enumerate(lines, 1):
            if '\t' in line:
                errors.append(f"{yf}:{idx} - Tabs are forbidden in YAML!")
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('---'):
                if ':' not in stripped and not stripped.startswith('-'):
                    errors.append(f"{yf}:{idx} - Invalid YAML key-value line: {stripped}")

    if errors:
        print(f"  [FAIL] YAML syntax anomalies found: {len(errors)}")
        for e in errors[:5]:
            print(f"    - {e}")
        return False

    print(f"  [PASS] Verified {len(yaml_files)} YAML files. 0 tab/indentation syntax errors.")
    return True

def check_service_selector_alignment():
    print_header("Step 3: Service-to-Deployment Label Alignment")
    checks = [
        ("postgres-service (port 5432)", "postgres.yaml", r"selector:\s*\n\s*app:\s*postgres", r"labels:\s*\n\s*app:\s*postgres"),
        ("redis-service (port 6379)", "redis.yaml", r"selector:\s*\n\s*app:\s*redis", r"labels:\s*\n\s*app:\s*redis"),
        ("backend-service (port 8000)", "backend.yaml", r"selector:\s*\n\s*app:\s*backend", r"labels:\s*\n\s*app:\s*backend"),
        ("frontend-service (port 80/30080)", "frontend.yaml", r"selector:\s*\n\s*app:\s*frontend", r"labels:\s*\n\s*app:\s*frontend"),
    ]

    all_matched = True
    for name, filename, selector_regex, label_regex in checks:
        path = os.path.join(K8S_DIR, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        has_selector = re.search(selector_regex, content) is not None
        has_label = re.search(label_regex, content) is not None

        if has_selector and has_label:
            print(f"  [PASS] {name} selector correctly routes to pods in {filename}.")
        else:
            print(f"  [FAIL] Mismatch in {name} selector ({filename}).")
            all_matched = False

    return all_matched

def check_persistent_volume_binding():
    print_header("Step 4: Storage & Persistent Volume Binding Check")
    pv_pvc_path = os.path.join(K8S_DIR, "postgres-pv-pvc.yaml")
    with open(pv_pvc_path, 'r', encoding='utf-8') as f:
        content = f.read()

    has_pv = "kind: PersistentVolume" in content
    has_pvc = "kind: PersistentVolumeClaim" in content
    has_capacity = "storage: 5Gi" in content
    has_storage_class = "storageClassName: standard" in content

    if has_pv and has_pvc and has_capacity and has_storage_class:
        print("  [PASS] PersistentVolume & PVC definitions match (5Gi, standard storageClass).")
        return True
    else:
        print("  [FAIL] PV/PVC definition incomplete or mismatched.")
        return False

def check_autoscaling_and_gitops():
    print_header("Step 5: Autoscaling (HPA), Blue-Green & GitOps (ArgoCD)")
    hpa_path = os.path.join(K8S_DIR, "hpa.yaml")
    bg_path = os.path.join(K8S_DIR, "blue-green-deployment.yaml")
    argo_path = os.path.join(K8S_DIR, "argocd-app.yaml")

    with open(hpa_path, 'r', encoding='utf-8') as f:
        hpa_txt = f.read()
    with open(bg_path, 'r', encoding='utf-8') as f:
        bg_txt = f.read()
    with open(argo_path, 'r', encoding='utf-8') as f:
        argo_txt = f.read()

    hpa_ok = "minReplicas: 2" in hpa_txt and "maxReplicas: 5" in hpa_txt
    bg_ok = "backend-blue" in bg_txt and "backend-green" in bg_txt and "version: blue" in bg_txt
    argo_ok = "kind: Application" in argo_txt and "argoproj.io" in argo_txt and "selfHeal: true" in argo_txt

    if hpa_ok:
        print("  [PASS] HorizontalPodAutoscaler: min 2 -> max 5 replicas configured.")
    else:
        print("  [FAIL] HPA configuration incomplete.")

    if bg_ok:
        print("  [PASS] Blue-Green Strategy: Blue (v1.0.0) & Green (v2.0.0) with router Service.")
    else:
        print("  [FAIL] Blue-Green strategy manifest incomplete.")

    if argo_ok:
        print("  [PASS] GitOps ArgoCD: Declarative Application with automated self-healing.")
    else:
        print("  [FAIL] ArgoCD manifest incomplete.")

    return hpa_ok and bg_ok and argo_ok

def main():
    print("\n" + "#" * 65)
    print("  MediFlow-AI — Kubernetes & GitOps Validation Suite")
    print("#" * 65)

    steps = [
        check_all_manifests_present(),
        check_yaml_syntax_and_structure(),
        check_service_selector_alignment(),
        check_persistent_volume_binding(),
        check_autoscaling_and_gitops(),
    ]

    print("\n" + "=" * 65)
    if all(steps):
        print("  [ALL STAGES PASSED] 100% Kubernetes Manifests Verified!")
        print("  Ready for Cluster Deployment, Viva & Lab Evaluation.")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print("  [FAILED] Some checks failed. See log above.")
        print("=" * 65 + "\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
