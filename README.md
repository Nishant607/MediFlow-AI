# MediFlow AI — Hospital Management System

A full-stack, AI-powered hospital management platform built as a portfolio project. It covers the complete patient lifecycle — from appointment booking and medical records through billing, notifications, and an AI-powered patient assistant — with role-based access for patients, doctors, and administrators.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11+, Django 5, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL (SQLite for local dev) |
| **Async / Scheduling** | Celery, Redis, Celery Beat |
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router |
| **AI — LLM** | Groq API (llama-3 family) |
| **AI — Retrieval** | scikit-learn TF-IDF (keyword-based, no vector DB) |
| **AI — PDF parsing** | pypdf |
| **API Docs** | drf-spectacular (OpenAPI 3 / Swagger UI) |
| **Containerization** | Docker + docker-compose |
| **Testing** | pytest, pytest-django, pytest-cov |
| **CI** | GitHub Actions (lint + full test suite on every push) |
| **Error Monitoring** | Sentry (optional, off by default) |

---

## Features

### Roles & Authentication
- JWT-based login with refresh tokens
- Three roles: **Patient**, **Doctor**, **Admin**
- Doctor registration requires admin approval before access

### Appointments
- Patients book time-slotted appointments with approved doctors
- Conflict detection (no double-booking the same doctor slot)
- Doctor schedule view (day-by-day)
- Cancel with role-based authorization

### Medical Records
- Patients upload PDF / image medical reports
- Doctors complete consultations → auto-generates prescription records
- Role-scoped access: patients see their own, doctors see patients they've treated, admins see all
- Appointment status auto-transitions to COMPLETED when prescription is saved

### Billing
- Invoice auto-created (Rs. 500 Consultation Fee) when doctor submits consultation
- Patient pays via a dummy payment endpoint → invoice status → PAID
- Admin can view all invoices

### Notifications
- In-app notifications for: appointment booked, appointment cancelled, invoice generated, appointment reminder
- Daily reminder Celery Beat task (runs at 8 AM) for tomorrow's appointments
- Email notifications via console backend in dev (SMTP-configurable for production)

### AI Patient Assistant
- Chat interface grounded in uploaded knowledge base documents (FAQ, policies, department info)
- TF-IDF retrieval selects the most relevant chunks before LLM call
- Emergency keyword detection returns a fixed emergency response without an LLM call
- PDF report summarization (patient uploads, gets an AI plain-language summary)
- Doctor patient-history summarization (doctor gets an AI summary of a patient's full history)
- Conversation history persisted per patient
- Rate-limited: 15 messages/minute

### Emergency Help
- Public emergency contact directory (no login required)
- AI chat detects emergency keywords → surfaces emergency contacts immediately

### Admin Dashboard
- Approve / reject doctor registrations
- View audit log (all significant actions, filterable by action type, max 100 entries)
- Manage AI knowledge base documents
- Send bulk appointment reminders
- View all invoices

### API Documentation
- Interactive Swagger UI at `/api/docs/`
- OpenAPI 3.0 schema at `/api/schema/`

---

## Quick Start (Docker — Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/mediflow-ai.git
cd mediflow-ai/hospital-ai

# 2. Create your .env from the example
cp backend/.env.example backend/.env
# Edit backend/.env and set GROQ_API_KEY (required for AI features)

# 3. Build and start everything
docker compose up --build

# 4. In a separate terminal, seed initial data (optional)
docker compose exec backend python manage.py migrate
```

- **Backend API:** http://localhost:8000/api/
- **Swagger UI:** http://localhost:8000/api/docs/
- **Frontend:** http://localhost:5173/

---

## Manual Setup (without Docker)

### Backend

```bash
cd hospital-ai/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Copy and configure .env
cp .env.example .env
# Set DATABASE_URL, REDIS_URL, GROQ_API_KEY in .env

python manage.py migrate
python manage.py runserver

# In a separate terminal (Celery worker):
celery -A config worker -l info

# In another terminal (Celery Beat for scheduled reminders):
celery -A config beat -l info
```

### Frontend

```bash
cd hospital-ai/frontend
npm install
npm run dev
```

---

## AI Features Setup

> [!IMPORTANT]
> **A `GROQ_API_KEY` is required for the AI Patient Assistant, report summarization, and doctor patient-history summary to work.**
> Get a free API key at **https://console.groq.com** — no credit card required.

Set it in `backend/.env`:
```
GROQ_API_KEY=gsk_your_key_here
```

---

## Running Tests

```bash
cd hospital-ai/backend
python -m pytest --cov=apps -q
```

**Final test results (Phase 12):**
- **116 tests** — 115 unit/integration tests across all 10 apps + 1 comprehensive end-to-end journey test
- **95% overall coverage**
- 0 failures

The end-to-end test (`e2e_tests/test_full_patient_journey.py`) simulates the full patient lifecycle in a single test — registration, doctor approval, appointment booking, notification, consultation, invoice creation, payment, and AI chat — with the LLM mocked (no real Groq call).

---

## Architecture Notes

The following are deliberate simplifications made throughout this project. Being explicit about these is a strength in a portfolio project — it shows awareness of production concerns.

| Simplification | What was done | Production alternative |
|---|---|---|
| **AI retrieval** | TF-IDF keyword matching (scikit-learn) | Vector embeddings + vector DB (Pinecone, pgvector) |
| **Payments** | Dummy `POST /pay/` endpoint — no real payment gateway | Stripe, Razorpay, PayPal integration |
| **Email** | Console backend (prints to logs) by default | Real SMTP — configure `EMAIL_HOST` in `.env` |
| **Report parsing** | pypdf text extraction only (no OCR) | Tesseract OCR for scanned/image PDFs |
| **Data security** | Standard Django field storage | Field-level DB encryption for sensitive medical data |
| **API Docs** | `/api/docs/` is publicly accessible in dev | Should be restricted or disabled in production |

---

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for all supported variables with comments.

**Required:**
- `SECRET_KEY` — Django secret key
- `DATABASE_URL` — PostgreSQL connection string
- `GROQ_API_KEY` — For AI features

**Optional:**
- `REDIS_URL` — Defaults to `redis://localhost:6379/0`
- `SENTRY_DSN` — For error monitoring (leave blank to disable)
- `EMAIL_HOST` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` — For real SMTP email

---

## Interactive API Documentation

Once the backend is running, visit **[http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)** for the full Swagger UI covering all endpoints.
