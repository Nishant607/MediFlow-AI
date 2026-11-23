# Phase 4, 10 & 11: Kubernetes Deployment, GitOps & Advanced Strategies
**Course:** DevOps & Automation Lab (ENSP461) — Capstone Project  
**Application:** MediFlow-AI (Hospital Management System)  
**Total Covered Marks:** 25 Marks (Kubernetes: 15, Blue-Green Strategy: 5, GitOps: 5)

---

## 1. Kubernetes Architecture Overview

The MediFlow-AI system is structured into an isolated, cloud-native architecture deployed in the `mediflow` namespace:

```
                            [ Internet Users ]
                                    │
                                    ▼
                         [ Kubernetes Ingress ]
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
     Path: /api                                           Path: /
 [ backend-service ]                                [ frontend-service ]
   (ClusterIP: 8000)                                  (NodePort: 30080)
          │                                                   │
          ▼                                                   ▼
[ backend-deployment ]                             [ frontend-deployment ]
  (Replicas: 2 to 5)                                     (Replicas: 2)
  Django REST APIs                                        React Nginx UI
          │
    ┌─────┴─────────────────────────┐
    ▼                               ▼
[ postgres-service ]        [ redis-service ]
(Stateful PVC: 5Gi)        (Cache & Broker)
```

---

## 2. Manifest Inventory (`k8s/` Directory)

| File | Kind | Purpose |
| :--- | :--- | :--- |
| `namespace.yaml` | `Namespace` | Creates isolated `mediflow` environment. |
| `configmap.yaml` | `ConfigMap` | Non-sensitive configs (hosts, ports, CORS). |
| `secrets.yaml` | `Secret` | Base64 credentials (Postgres pass, Django Secret). |
| `postgres-pv-pvc.yaml` | `PersistentVolume`, `PVC` | 5Gi persistent disk storage for database records. |
| `postgres.yaml` | `Deployment`, `Service` | PostgreSQL 15 database instance. |
| `redis.yaml` | `Deployment`, `Service` | In-memory cache and Celery task broker. |
| `backend.yaml` | `Deployment`, `Service` | High-availability Django API with health probes. |
| `celery.yaml` | `Deployment` | Celery asynchronous background worker. |
| `frontend.yaml` | `Deployment`, `Service` | React Vite frontend served via Nginx (NodePort 30080). |
| `ingress.yaml` | `Ingress` | Reverse proxy routing traffic to backend and frontend. |
| `hpa.yaml` | `HorizontalPodAutoscaler` | Auto-scales backend from 2 to 5 pods when CPU > 70%. |
| `blue-green-deployment.yaml`| `Deployment`, `Service` | Zero-downtime Blue-Green deployment strategy. |
| `argocd-app.yaml` | `Application` (CRD) | GitOps automated reconciliation via ArgoCD. |

---

## 3. How to Demonstrate in Lab / Viva

The examiner will ask you to demonstrate **Scaling**, **Rolling Update**, **Rollback**, **Blue-Green**, and **GitOps**. Here are the exact commands:

### A. Deploy Entire Stack
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```
Verify all pods are running:
```bash
kubectl get pods -n mediflow
kubectl get svc -n mediflow
```

### B. Demonstrate Auto-Scaling (Phase 4)
Show manual scaling:
```bash
kubectl scale deployment/backend-deployment -n mediflow --replicas=5
kubectl get pods -n mediflow -l app=backend
```
Show Horizontal Pod Autoscaler (HPA):
```bash
kubectl get hpa -n mediflow
```

### C. Demonstrate Zero-Downtime Rolling Update (Phase 4)
Update backend to a new image version:
```bash
kubectl set image deployment/backend-deployment backend=hospital_ai_backend:v2.0.0 -n mediflow
kubectl rollout status deployment/backend-deployment -n mediflow
```

### D. Demonstrate Rollback (Phase 4)
If a faulty image was deployed, rollback instantly to the previous working state:
```bash
kubectl rollout undo deployment/backend-deployment -n mediflow
kubectl rollout history deployment/backend-deployment -n mediflow
```

### E. Demonstrate Blue-Green Deployment (Phase 10)
1. Deploy both Blue (v1.0.0) and Green (v2.0.0):
   ```bash
   kubectl apply -f k8s/blue-green-deployment.yaml
   ```
2. The router service points to `version: blue`.
3. To switch all traffic instantly to Green without dropping a single user request:
   ```bash
   kubectl patch service backend-blue-green-service -n mediflow -p '{"spec":{"selector":{"version":"green"}}}'
   ```
4. Verify traffic immediately shifts to the Green environment!

### F. Demonstrate GitOps with ArgoCD (Phase 11)
Apply the ArgoCD manifest:
```bash
kubectl apply -f k8s/argocd-app.yaml
```
ArgoCD continuously compares the Git repository (`k8s/` folder) with the live cluster. Any change pushed to Git is automatically synchronized, and any unauthorized manual change on the cluster is automatically healed (`selfHeal: true`).

---

## 4. Local Validation Command

Run the automated test suite without a live cluster:
```bash
python scripts/verify_k8s.py
```
Output: `[ALL STAGES PASSED] 100% Kubernetes Manifests Verified!`
