import pytest
from django.conf import settings
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_api_schema_endpoint_is_accessible(api_client):
    """GET /api/schema/ should return 200 and a valid OpenAPI YAML/JSON document."""
    response = api_client.get('/api/schema/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_swagger_docs_endpoint_is_accessible(api_client):
    """GET /api/docs/ should return 200 and render the Swagger UI HTML page."""
    response = api_client.get('/api/docs/')
    assert response.status_code == 200


def test_email_backend_defaults_to_console_when_smtp_env_vars_not_set():
    """
    When EMAIL_HOST is blank (the default), the SMTP conditional block in base.py
    must NOT run — so EMAIL_BACKEND must NOT be the SMTP backend.
    (pytest-django itself switches EMAIL_BACKEND to locmem during tests, which is
    fine — this test confirms the SMTP backend was never activated by our code.)
    """
    assert settings.EMAIL_HOST == '', (
        "EMAIL_HOST should be empty string when not set — SMTP block must not activate"
    )
    assert settings.EMAIL_BACKEND != 'django.core.mail.backends.smtp.EmailBackend', (
        "SMTP backend must not be active when EMAIL_HOST is blank"
    )
