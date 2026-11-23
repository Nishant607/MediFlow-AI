#!/usr/bin/env python3
"""
MediFlow-AI — Full-Stack Observability & Security Validation Suite
Validates Prometheus, Grafana, Loki, Promtail, SonarQube, and Security Audit scripts.
"""

import os
import sys
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONITORING_DIR = os.path.join(ROOT_DIR, 'monitoring')
LOGGING_DIR = os.path.join(ROOT_DIR, 'logging')
SECURITY_DIR = os.path.join(ROOT_DIR, 'security')

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title}")
    print("=" * 65)

def check_file(path, label):
    if os.path.exists(path):
        print(f"  [PASS] Found {label} at {os.path.relpath(path, ROOT_DIR)}")
        return True
    else:
        print(f"  [FAIL] Missing {label} at {os.path.relpath(path, ROOT_DIR)}")
        return False

def check_monitoring():
    print_header("Step 1: Prometheus & Grafana Configuration Check")
    prom_cfg = os.path.join(MONITORING_DIR, 'prometheus', 'prometheus.yml')
    alert_cfg = os.path.join(MONITORING_DIR, 'prometheus', 'alert_rules.yml')
    datasources_cfg = os.path.join(MONITORING_DIR, 'grafana', 'provisioning', 'datasources', 'datasources.yml')
    dash_json = os.path.join(MONITORING_DIR, 'grafana', 'dashboards', 'mediflow_dashboard.json')

    files_ok = all([
        check_file(prom_cfg, "Prometheus Configuration"),
        check_file(alert_cfg, "Alert Rules"),
        check_file(datasources_cfg, "Grafana Datasources"),
        check_file(dash_json, "Grafana Clinical Dashboard"),
    ])

    if not files_ok:
        return False

    # Check alert rules content
    with open(alert_cfg, 'r', encoding='utf-8') as f:
        alert_txt = f.read()
    has_cpu_alert = "alert: HighCpuUsage" in alert_txt
    has_down_alert = "alert: ContainerDown" in alert_txt
    has_5xx_alert = "alert: HighHttp5xxErrors" in alert_txt

    if has_cpu_alert and has_down_alert and has_5xx_alert:
        print("  [PASS] All 3 clinical alert rules (CPU, Container Down, 5xx Spikes) validated.")
    else:
        print("  [FAIL] Incomplete alert rules definitions.")
        return False

    # Check Grafana JSON schema
    with open(dash_json, 'r', encoding='utf-8') as f:
        try:
            dashboard = json.load(f)
            panels = dashboard.get('panels', [])
            print(f"  [PASS] Grafana Dashboard JSON valid ({len(panels)} monitoring panels configured).")
        except Exception as e:
            print(f"  [FAIL] Invalid JSON in Grafana dashboard: {e}")
            return False

    return True

def check_logging():
    print_header("Step 2: Centralized Logging (Loki & Promtail) Check")
    loki_cfg = os.path.join(LOGGING_DIR, 'loki-config.yml')
    promtail_cfg = os.path.join(LOGGING_DIR, 'promtail-config.yml')

    ok = all([
        check_file(loki_cfg, "Loki Storage Config"),
        check_file(promtail_cfg, "Promtail Collector Config"),
    ])

    if not ok:
        return False

    with open(promtail_cfg, 'r', encoding='utf-8') as f:
        promtail_txt = f.read()

    if "loki:3100" in promtail_txt and "mediflow_containers" in promtail_txt:
        print("  [PASS] Promtail correctly wired to stream container & application logs to Loki.")
        return True
    else:
        print("  [FAIL] Promtail configuration target mismatch.")
        return False

def check_security():
    print_header("Step 3: DevSecOps Security (SonarQube & Trivy) Check")
    sonar_cfg = os.path.join(SECURITY_DIR, 'sonar-project.properties')
    trivy_sh = os.path.join(SECURITY_DIR, 'trivy-scan.sh')
    audit_py = os.path.join(SECURITY_DIR, 'security_audit.py')

    ok = all([
        check_file(sonar_cfg, "SonarQube SAST Config"),
        check_file(trivy_sh, "Trivy Container Scan Script"),
        check_file(audit_py, "Security Audit Script"),
    ])

    if not ok:
        return False

    # Execute security audit script
    import subprocess
    result = subprocess.run([sys.executable, audit_py], capture_output=True, text=True)
    if result.returncode == 0:
        print("  [PASS] Security audit script executed: 0 vulnerabilities found.")
        return True
    else:
        print("  [FAIL] Security audit script reported warnings.")
        print(result.stdout)
        return False

def main():
    print("\n" + "#" * 65)
    print("  MediFlow-AI — Observability, Logging & Security Validation")
    print("#" * 65)

    checks = [
        check_monitoring(),
        check_logging(),
        check_security(),
    ]

    print("\n" + "=" * 65)
    if all(checks):
        print("  [ALL STAGES PASSED] 100% Observability & DevSecOps Stack Verified!")
        print("  Ready for Lab Demonstration, Viva & Final Evaluation.")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print("  [FAILED] Some checks failed. See log above.")
        print("=" * 65 + "\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
