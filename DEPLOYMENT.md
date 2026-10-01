# Deployment Guide — MediFlow AI

This document describes how to deploy MediFlow AI to free-tier cloud services. No automation is performed here — this is a reference checklist only.

---

## Recommended Free-Tier Deployment Options

### Backend (Django + PostgreSQL + Redis)

| Service | Notes |
|---|---|
| **[Render](https://render.com)** | Free tier for web services + PostgreSQL + Redis. Easiest for Django. Auto-deploys from GitHub. |
| **[Railway](https://railway.app)** | Free trial credits. Supports Django, PostgreSQL, and Redis in one project. Good DX. |

Both support Docker-based deployments. Use the provided `Dockerfile` in `backend/`.

### Frontend (React / Vite)

| Service | Notes |
|---|---|
| **[Vercel](https://vercel.com)** | Best-in-class for Vite/React. Free tier. Auto-deploy from GitHub. Set `VITE_API_URL` env var. |
| **[Netlify](https://netlify.com)** | Also excellent for React SPAs. Free tier. Similar setup to Vercel. |

---

## Environment Variables Checklist

Set all of the following in your hosting platform's environment variable settings before deploying.

### Required

| Variable | Example / Notes |
|---|---|
| `SECRET_KEY` | Generate a new one: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DATABASE_URL` | Provided automatically by Render/Railway PostgreSQL add-on |
| `REDIS_URL` | Provided automatically by Render/Railway Redis add-on |
| `GROQ_API_KEY` | From https://console.groq.com — required for AI features |
| `ALLOWED_HOSTS` | Your production domain, e.g. `mediflow-ai.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Your frontend URL, e.g. `https://mediflow-ai.vercel.app` |

### Optional but Recommended

| Variable | Notes |
|---|---|
| `SENTRY_DSN` | From https://sentry.io — free tier. Enables error monitoring in production. |
| `EMAIL_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) for real email delivery |
| `EMAIL_PORT` | `587` for TLS |
| `EMAIL_HOST_USER` | Your SMTP email address |
| `EMAIL_HOST_PASSWORD` | App password (not your account password) |
| `EMAIL_USE_TLS` | `True` |

---

## Pre-Launch Checklist

> [!CAUTION]
> **Do not launch without completing these steps.**

- [ ] `DEBUG=False` — never run production with `DEBUG=True`
- [ ] `SECRET_KEY` is a long, random, unique string — not the dev placeholder
- [ ] `ALLOWED_HOSTS` contains only your production domain
- [ ] `CORS_ALLOWED_ORIGINS` contains only your frontend domain
- [ ] Database migrations have been applied: `python manage.py migrate`
- [ ] Static files collected (if serving via Django): `python manage.py collectstatic`
- [ ] `GROQ_API_KEY` is set — AI features will silently fail without it
- [ ] Celery worker and Celery Beat are running as separate services (not inside the web process)

---

## API Documentation in Production

> [!WARNING]
> **The `/api/docs/` (Swagger UI) and `/api/schema/` endpoints are publicly accessible by default.**
> In production, you should either:
> - **Disable them** by removing the routes from `config/urls.py`, or
> - **Restrict them** using Django's `@login_required` decorator or an IP allowlist in your reverse proxy / hosting platform

This was intentionally left open for development and portfolio review purposes.

---

## Celery Workers on Render / Railway

Both Render and Railway support running multiple services from one repository. Add two additional services pointing to the same repo:

**Celery Worker command:**
```
celery -A config worker -l info
```

**Celery Beat command:**
```
celery -A config beat -l info
```

Both services need the same environment variables as the main web service.

---

## Frontend Configuration

Set the following environment variable in your Vercel / Netlify project settings:

```
VITE_API_URL=https://your-backend-domain.onrender.com
```

Then deploy from the `hospital-ai/frontend` directory (set the root directory in your hosting settings).
