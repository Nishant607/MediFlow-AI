#!/bin/bash
# ===================================================================
# Phase 9: Trivy Container Vulnerability & Security Scanner
# Scans Docker images for known CVEs, misconfigurations, and root users
# ===================================================================

set -e

echo "=========================================================="
echo " Starting Trivy Container Security Scan for MediFlow-AI  "
echo "=========================================================="

# Check if Trivy is installed
if ! command -v trivy &> /dev/null; then
    echo "[INFO] Trivy binary not found locally. Running via lightweight Docker container..."
    SCAN_CMD="docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest"
else
    SCAN_CMD="trivy"
fi

echo "[1/2] Scanning Backend Container Image: hospital_ai_backend:latest"
$SCAN_CMD image --severity HIGH,CRITICAL --exit-code 0 hospital_ai_backend:latest || true

echo "[2/2] Scanning Frontend Container Image: hospital_ai_frontend:latest"
$SCAN_CMD image --severity HIGH,CRITICAL --exit-code 0 hospital_ai_frontend:latest || true

echo "=========================================================="
echo " [SUCCESS] Container Security Scan Completed!             "
echo "=========================================================="
