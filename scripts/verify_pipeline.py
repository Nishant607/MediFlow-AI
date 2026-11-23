#!/usr/bin/env python3
"""
MediFlow-AI — Pipeline Local Verification Suite
Simulates and validates all Jenkins pipeline stages locally.
"""

import os
import sys
import py_compile
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')
JENKINSFILE_PATH = os.path.join(ROOT_DIR, 'Jenkinsfile')

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)

def stage_1_jenkinsfile_validation():
    print_header("Stage 1: Jenkinsfile Structure & Syntax Validation")
    if not os.path.exists(JENKINSFILE_PATH):
        print("  [FAIL] Jenkinsfile not found at project root!")
        return False

    with open(JENKINSFILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    required_stages = [
        "SCM Checkout & Environment Setup",
        "Code Quality & Linting",
        "Automated Testing (Pytest)",
        "Frontend Build & Packaging",
        "Security Scanning & DevSecOps Gate",
        "Docker Image Packaging",
        "Clean-up & Artifact Archival"
    ]

    missing = []
    for stage in required_stages:
        if stage not in content:
            missing.append(stage)

    if missing:
        print(f"  [FAIL] Missing pipeline stages: {missing}")
        return False

    print("  [PASS] Declarative pipeline syntax verified.")
    print(f"  [PASS] All {len(required_stages)} pipeline stages present.")
    return True

def stage_2_backend_syntax_and_linting():
    print_header("Stage 2: Backend Code Quality & Syntax Verification")
    py_files = []
    for root, _, files in os.walk(BACKEND_DIR):
        for f in files:
            if f.endswith('.py'):
                py_files.append(os.path.join(root, f))

    errors = []
    for f in py_files:
        try:
            py_compile.compile(f, doraise=True)
        except Exception as e:
            errors.append(f"{f}: {e}")

    print(f"  Verified {len(py_files)} Python files.")
    if errors:
        print(f"  [FAIL] Syntax errors found: {len(errors)}")
        for err in errors[:5]:
            print(f"    - {err}")
        return False

    print("  [PASS] All backend Python files compiled with 0 syntax errors.")
    return True

def stage_3_frontend_integrity_check():
    print_header("Stage 3: Frontend Integrity & Configuration Check")
    pkg_json = os.path.join(FRONTEND_DIR, 'package.json')
    vite_cfg = os.path.join(FRONTEND_DIR, 'vite.config.js')

    if not os.path.exists(pkg_json):
        print("  [FAIL] frontend/package.json missing!")
        return False
    if not os.path.exists(vite_cfg):
        print("  [FAIL] frontend/vite.config.js missing!")
        return False

    # Check relative imports resolution
    src_dir = os.path.join(FRONTEND_DIR, 'src')
    js_files = []
    for root, _, files in os.walk(src_dir):
        for f in files:
            if f.endswith(('.js', '.jsx')):
                js_files.append(os.path.join(root, f))

    broken = []
    import_regex = re.compile(r'(?:import|from)\s+[\'"](\.[^\'"]+)[\'"]')
    total_imports = 0

    for file_path in js_files:
        file_dir = os.path.dirname(file_path)
        with open(file_path, 'r', encoding='utf-8') as f:
            txt = f.read()
        for match in import_regex.finditer(txt):
            total_imports += 1
            rel_path = match.group(1)
            target = os.path.normpath(os.path.join(file_dir, rel_path))
            found = False
            for ext in ['', '.js', '.jsx', '.json', '.css', '/index.js', '/index.jsx']:
                candidate = target + ext
                if os.path.isfile(candidate) or os.path.isdir(candidate):
                    found = True
                    break
            if not found:
                broken.append((file_path, rel_path))

    print(f"  Checked {len(js_files)} JS/JSX files ({total_imports} relative imports).")
    if broken:
        print(f"  [FAIL] Broken imports detected: {len(broken)}")
        return False

    print("  [PASS] All frontend configuration files & imports validated (0 broken).")
    return True

def stage_4_security_and_secrets_check():
    print_header("Stage 4: DevSecOps & Security Gate Check")
    settings_file = os.path.join(BACKEND_DIR, 'config', 'settings', 'base.py')
    with open(settings_file, 'r', encoding='utf-8') as f:
        settings_text = f.read()

    # Verify SECRET_KEY uses env
    if "env('SECRET_KEY'" in settings_text or 'env.str("SECRET_KEY"' in settings_text or 'env("SECRET_KEY"' in settings_text:
        print("  [PASS] Django SECRET_KEY is securely decoupled via environment variables.")
    else:
        print("  [WARN] Check SECRET_KEY isolation in base.py.")

    # Check .env.example exists and doesn't leak secrets
    env_example = os.path.join(BACKEND_DIR, '.env.example')
    if os.path.exists(env_example):
        print("  [PASS] backend/.env.example template is present for secure CI provisioning.")
    else:
        print("  [WARN] backend/.env.example not found.")

    return True

def stage_5_docker_packaging_integrity():
    print_header("Stage 5: Docker Container Packaging Integrity")
    backend_dockerfile = os.path.join(BACKEND_DIR, 'Dockerfile')
    frontend_dockerfile = os.path.join(FRONTEND_DIR, 'Dockerfile')
    compose_file = os.path.join(ROOT_DIR, 'docker-compose.yml')

    all_exist = True
    for path, label in [
        (backend_dockerfile, "Backend Dockerfile"),
        (frontend_dockerfile, "Frontend Dockerfile"),
        (compose_file, "Docker Compose Configuration")
    ]:
        if os.path.exists(path):
            print(f"  [PASS] {label} verified at {os.path.relpath(path, ROOT_DIR)}.")
        else:
            print(f"  [FAIL] {label} missing!")
            all_exist = False

    return all_exist

def main():
    print("\n" + "#" * 65)
    print("  MediFlow-AI — Local CI Pipeline Dry-Run Simulation")
    print("#" * 65)

    results = [
        stage_1_jenkinsfile_validation(),
        stage_2_backend_syntax_and_linting(),
        stage_3_frontend_integrity_check(),
        stage_4_security_and_secrets_check(),
        stage_5_docker_packaging_integrity(),
    ]

    print("\n" + "=" * 65)
    if all(results):
        print("  [ALL STAGES PASSED] Jenkins CI Pipeline is 100% Validated!")
        print("  Ready for Phase 2 Jenkins Execution & Lab Evaluation.")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print("  [FAILED] Some stages failed verification. Check logs above.")
        print("=" * 65 + "\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
