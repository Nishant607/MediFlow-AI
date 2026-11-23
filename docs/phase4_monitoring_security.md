# Phase 7, 8 & 9: Full-Stack Observability, Centralized Logging & DevSecOps Security
**Course:** DevOps & Automation Lab (ENSP461) — Capstone Project  
**Application:** MediFlow-AI (Hospital Management System)  
**Total Covered Marks:** 10 Marks (Monitoring & Logging: 5, Security: 5)

---

## 1. Observability & Security Architecture

```
                                [ MediFlow Hospital Stack ]
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
               [ Metrics Stream ]                          [ Logs Stream ]
             (CPU, RAM, API calls)                     (Audit Logs, App Events)
                       │                                           │
                       ▼                                           ▼
             [ Prometheus Engine ]                       [ Promtail Collector ]
                 (Port: 9090)                                      │
                       │                                           ▼
                       │                                    [ Loki Storage ]
                       │                                      (Port: 3100)
                       └─────────────────────┬─────────────────────┘
                                             ▼
                               [ Grafana Unified UI ]
                                    (Port: 3000)
                              Live Clinical Dashboards
```

---

## 2. Component Inventory

### A. Metrics Monitoring (`monitoring/`)
- **Prometheus (`monitoring/prometheus/prometheus.yml`)**:
  Polls metrics every 15s from Django backend, container cAdvisor, and system node_exporter.
- **Alert Rules (`monitoring/prometheus/alert_rules.yml`)**:
  - `HighCpuUsage`: Triggers warning if CPU > 85% for 2m.
  - `ContainerDown`: Triggers critical alert if hospital container terminates.
  - `HighHttp5xxErrors`: Triggers alert on clinical API error rate spikes.
- **Grafana Dashboard (`monitoring/grafana/dashboards/mediflow_dashboard.json`)**:
  Pre-provisioned dashboard displaying CPU usage gauge, RAM consumption, and live HTTP request throughput.

### B. Centralized Logging (`logging/`)
- **Loki (`logging/loki-config.yml`)**: High-efficiency, cloud-native log storage engine indexing log metadata labels without high RAM overhead.
- **Promtail (`logging/promtail-config.yml`)**: Lightweight agent streaming logs from Django audit trail and container runtimes into Loki.

### C. DevSecOps & Security (`security/`)
- **SonarQube (`security/sonar-project.properties`)**: Static Application Security Testing (SAST) scanning for code smells, bugs, and security vulnerabilities.
- **Trivy Container Scanner (`security/trivy-scan.sh`)**: Scans `hospital_ai_backend` and `hospital_ai_frontend` Docker images for Common Vulnerabilities and Exposures (CVEs).
- **Security Audit (`security/security_audit.py`)**: Validates credential isolation, non-root execution, and 3-tier Role-Based Access Control (Admin, Doctor, Patient).

---

## 3. How to Run & Demonstrate for the Examiner

### Run Observability Stack with 1 Command:
```bash
docker compose -f docker-compose.monitoring.yml up -d
```

### Access Dashboards in Browser:
- **Grafana Dashboard:** `http://localhost:3000` (User: `admin` | Password: `admin`)
- **Prometheus Targets & Metrics:** `http://localhost:9090`
- **Loki Log Gateway:** `http://localhost:3100/ready`

### Stop Observability Stack:
```bash
docker compose -f docker-compose.monitoring.yml down
```

---

## 4. Key PromQL Queries for Viva

The examiner may ask you to write a PromQL query in the Prometheus/Grafana expression bar:

1. **Query CPU Usage percentage:**
   ```promql
   100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)
   ```
2. **Query Total HTTP Request Rate per Second:**
   ```promql
   sum(rate(django_http_requests_total_by_method[1m]))
   ```
3. **Query Memory Utilization percentage:**
   ```promql
   (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
   ```

---

## 5. Key Viva Questions & Answers

1. **Q: What is the difference between Monitoring and Logging?**  
   *Answer:* **Monitoring** (Prometheus) tracks numerical *Metrics* over time (CPU %, latency, request count) to tell you *WHEN* something is wrong. **Logging** (Loki) records detailed descriptive *text events* (stack traces, SQL queries) to tell you *WHY* it went wrong.

2. **Q: What is Shift-Left Security in DevSecOps?**  
   *Answer:* Rather than testing security only after production deployment, Shift-Left embeds security checks (SonarQube SAST, Trivy container scanning, secret detection) directly into the developer's CI pipeline before code is merged.

---

## 6. Local Validation Command

Run the automated test suite without external dependencies:
```bash
python scripts/verify_observability.py
```
Output: `[ALL STAGES PASSED] 100% Observability & DevSecOps Stack Verified!`
