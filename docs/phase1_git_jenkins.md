# Phase 1 & 2: Git Version Control & Jenkins CI Pipeline Documentation
**Course:** DevOps & Automation Lab (ENSP461) — Capstone Project  
**Application:** MediFlow-AI (Hospital Management System)

---

## 1. Git Workflow & Branching Strategy (Phase 1)

In compliance with industry-standard Git practices required by the capstone syllabus, the MediFlow-AI repository adopts the following branching architecture:

### Branch Topology:
- **`main`**: Production-ready branch. Only thoroughly tested, approved, and stable releases are merged here. Direct pushes to `main` are restricted.
- **`develop`**: The primary integration branch where all newly implemented features and bug fixes converge. Nightly CI builds run against this branch.
- **`feature/<feature-name>`**: Dedicated short-lived branches created for specific enhancements (e.g., `feature/patient-billing`, `feature/ai-assistant`). Merged back into `develop` via pull requests (PRs) after code review and automated CI validation.
- **`hotfix/<issue-name>`**: Urgent production patches branched directly from `main` and merged into both `main` and `develop`.

### Commit Message Convention:
Semantic commit messages are enforced across all branches:
- `feat:` Introduces a new functional capability or endpoint.
- `fix:` Resolves an identified defect or edge-case bug.
- `ci:` Modifies pipeline configuration files (`Jenkinsfile`, workflows).
- `docs:` Documentation changes or viva reports.
- `refactor:` Code improvements that do not alter external behavior.

---

## 2. Jenkins Declarative CI/CD Pipeline Architecture (Phase 2)

The project includes a production-grade, self-healing **Declarative Pipeline** defined in the root [Jenkinsfile](file:///c:/Users/sam/Desktop/MediFlow-AI/Jenkinsfile).

### Automated Pipeline Flow:
```
Developer Push ──► GitHub Webhook ──► Jenkins Trigger
                                            │
   ┌────────────────────────────────────────┴────────────────────────────────────────┐
   ▼                                        ▼                                        ▼
[Stage 1: Checkout]               [Stage 2: Code Quality]                  [Stage 3: Testing]
Git scm checkout & env setup      Python syntax & linting                  Pytest 167 backend files
   │                                        │                                        │
   └────────────────────────────────────────┬────────────────────────────────────────┘
                                            ▼
                           [Stage 4: Frontend Packaging]
                           Node 18 React assets build
                                            │
                                            ▼
                        [Stage 5: DevSecOps & Security Gate]
                        Secret isolation check & Trivy vulnerability scan
                                            │
                                            ▼
                        [Stage 6: Docker Image Packaging]
                        Build hospital_ai_backend & frontend images
                                            │
                                            ▼
                         [Stage 7: Clean-up & Archival]
                         Save test metrics & clean workspace
```

### Key Stages Explained for Viva / Evaluation:

1. **Stage 1: SCM Checkout & Environment Setup:**
   Extracts git commit hashes, sets build timestamps, and prepares environment variables (`PROJECT_NAME`, `DOCKER_REGISTRY`, `BUILD_NUMBER`).

2. **Stage 2: Code Quality & Linting:**
   Runs parallel syntax compilation (`py_compile`) across all 167 Python files and verifies frontend configuration files.

3. **Stage 3: Automated Testing (Pytest):**
   Executes automated unit and integration tests across all Django apps:
   - Authentication & JWT token refresh
   - Appointment slot allocation and cancellation
   - Clinical consultations and digital prescriptions
   - Billing signal auto-invoicing and payment
   - AI assistant guardrails and retrieval

4. **Stage 4: Frontend Build & Packaging:**
   Validates the Vite/React production build bundle and confirms zero broken module imports across 78 JS/JSX components.

5. **Stage 5: DevSecOps Gate:**
   Checks for hardcoded secret keys or leaked passwords in codebase files, enforcing environment variable isolation.

6. **Stage 6: Docker Image Packaging:**
   Compiles multi-container images for `hospital_ai_backend` and `hospital_ai_frontend`, tagging them with both `${BUILD_NUMBER}` for traceability and `latest` for production deployment.

7. **Stage 7 & Post Actions:**
   Employs `cleanWs` to remove temporary disk usage and prints clear success/failure banners.

---

## 3. GitHub Webhook Setup Guide

To link Jenkins to your GitHub repository for automated execution on every push:
1. Open your GitHub Repository ➔ **Settings** ➔ **Webhooks** ➔ **Add webhook**.
2. **Payload URL:** `http://<YOUR_JENKINS_SERVER_IP>:8080/github-webhook/`
3. **Content type:** `application/json`
4. **Which events would you like to trigger this webhook?** Select **Just the push event**.
5. Save webhook. Every `git push` now automatically triggers the Jenkins CI Pipeline.

---

## 4. Local Verification

To run a full local simulation of the Jenkins pipeline on any development machine without requiring a live Jenkins server:
```bash
python scripts/verify_pipeline.py
```
Expected output: `[ALL STAGES PASSED] Jenkins CI Pipeline is 100% Validated!`
