# MediFlow-AI — System Architecture Diagrams
**Course:** DevOps & Automation Lab (ENSP461) — Capstone Project  
**Application:** MediFlow-AI (Smart Clinical Suite & DevOps Pipeline)

---

## 1. Multi-Tier Application Architecture

This diagram illustrates the clinical request flow across frontend, backend, database, cache, background workers, and AI services:

```mermaid
flowchart TD
    User["Clinical Users (Patient / Doctor / Admin)"]
    
    subgraph Edge ["Edge & Reverse Proxy Tier"]
        Ingress["Kubernetes Ingress / Nginx"]
    end

    subgraph FrontendTier ["Presentation Tier (React 18 SPA)"]
        UI["React Web Application (NodePort 30080)"]
        Components["Dashboard | Book Appointment | Clinical Suite | Billing | AI Chat"]
    end

    subgraph BackendTier ["Application Logic Tier (Django REST Framework)"]
        API["Django REST API (Port 8000)"]
        AuthModule["JWT Auth & 3-Tier RBAC"]
        ApptModule["Appointment Slot Engine"]
        RecordModule["Medical Records & Prescriptions"]
        BillModule["Billing Signals & Auto-Invoicing"]
        AIModule["RAG Controller & Guardrails"]
    end

    subgraph DataTier ["Data & Asynchronous Services"]
        DB[("PostgreSQL 15 (Persistent 5Gi Storage)")]
        Redis[("Redis 7 (Cache & Broker)")]
        Worker["Celery Asynchronous Worker"]
        Beat["Celery Beat Periodic Scheduler"]
    end

    subgraph ExternalTier ["External AI Inference"]
        Groq["Groq Cloud API (LLaMA-3.3-70B)"]
    end

    User --> Ingress
    Ingress -->|Path: /| UI
    Ingress -->|Path: /api| API
    UI --> Components
    Components -->|HTTP/REST Calls| API
    API --> AuthModule
    API --> ApptModule
    API --> RecordModule
    API --> BillModule
    API --> AIModule
    API --> DB
    API --> Redis
    Redis --> Worker
    Beat --> Redis
    AIModule --> Groq
```

---

## 2. End-to-End DevOps CI/CD Pipeline Architecture

This diagram illustrates the automated lifecycle from developer commit to production Kubernetes cluster:

```mermaid
flowchart LR
    Dev["Developer"]
    Git["GitHub Repository"]
    Hook["GitHub Webhook"]
    
    subgraph CI ["Continuous Integration (Jenkins)"]
        JCheck["SCM Checkout"]
        JLint["Code Quality & Linting"]
        JTest["Pytest 167 Tests"]
        JScan["DevSecOps Gate"]
        JPack["Docker Image Build"]
        JClean["Artifact Archival"]
    end

    subgraph Registry ["Container Registry"]
        DReg["Docker Registry (Backend & Frontend Images)"]
    end

    subgraph IaC ["Infrastructure as Code & Config"]
        TF["Terraform (VPC, Security, EC2)"]
        Ans["Ansible (Docker & K8s Setup)"]
    end

    subgraph K8s ["Kubernetes Cluster (Namespace: mediflow)"]
        Argo["ArgoCD GitOps Controller"]
        Pods["Hospital Pods (Backend, Frontend, Postgres, Redis)"]
        HPA["Horizontal Pod Autoscaler (2 to 5 Pods)"]
    end

    subgraph ObservabilityTier ["Full-Stack Observability"]
        Prom["Prometheus Monitoring (:9090)"]
        Graf["Grafana Dashboards (:3000)"]
        Loki["Loki & Promtail Logging (:3100)"]
    end

    EndUser["Healthcare End Users"]

    Dev -->|git push| Git
    Git --> Hook
    Hook --> JCheck
    JCheck --> JLint --> JTest --> JScan --> JPack --> JClean
    JPack --> DReg
    TF -->|Provisions Cloud VM| K8s
    Ans -->|Installs Runtime| K8s
    Git -->|Monitors k8s/| Argo
    DReg -->|Pulls Images| Pods
    Argo -->|Syncs Manifests| Pods
    Pods --> HPA
    Pods --> Prom
    Pods --> Loki
    Prom --> Graf
    Loki --> Graf
    Pods --> EndUser
```

---

## 3. Zero-Downtime Blue-Green Deployment Topology

This diagram demonstrates how Blue-Green deployment enables 100% zero-downtime updates:

```
                    [ Incoming User Traffic ]
                               │
                               ▼
            [ Router Service: backend-blue-green-service ]
                               │
             ┌─────────────────┴─────────────────┐
             │ Current Active                    │ Staged & Ready
             ▼ (Selector: version=blue)          ▼ (Selector: version=green)
     [ Blue Deployment ]                 [ Green Deployment ]
    Version: 1.0.0 (Live)               Version: 2.0.0 (Tested)
    Replicas: 2 Pods                    Replicas: 2 Pods
    Handling All Patient Traffic        Ready for Instant Cutover
```

*Traffic Switch Command:*
```bash
kubectl patch service backend-blue-green-service -n mediflow -p '{"spec":{"selector":{"version":"green"}}}'
```
*Result:* Traffic immediately points to Green without dropping a single active connection or restarting containers.

---

## 4. Kubernetes Cluster Namespace (`mediflow`) Resource Topology

```
Namespace: mediflow
├── Config & Secrets
│   ├── ConfigMap: mediflow-config (DB Hosts, Redis URLs, CORS)
│   └── Secret: mediflow-secrets (Base64 Encrypted Passwords)
│
├── Storage Tier
│   ├── PersistentVolume: postgres-pv (5Gi Storage)
│   └── PersistentVolumeClaim: postgres-pvc
│
├── Workloads (Deployments)
│   ├── postgres-deployment (1 Replica)
│   ├── redis-deployment (1 Replica)
│   ├── backend-deployment (2 Replicas, Auto-Scales to 5 via HPA)
│   ├── celery-worker-deployment (1 Replica)
│   └── frontend-deployment (2 Replicas)
│
├── Networking & Routing
│   ├── Service: postgres-service (ClusterIP: 5432)
│   ├── Service: redis-service (ClusterIP: 6379)
│   ├── Service: backend-service (ClusterIP: 8000)
│   ├── Service: frontend-service (NodePort: 30080)
│   └── Ingress: mediflow-ingress (Routes /api to Backend, / to Frontend)
│
└── Governance & GitOps
    ├── HPA: backend-hpa (CPU target: 70%)
    └── ArgoCD Application: mediflow-ai (Automated Self-Healing)
```
