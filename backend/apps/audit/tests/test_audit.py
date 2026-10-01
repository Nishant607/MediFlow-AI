import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.audit.models import AuditLog
from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='admin10@test.com',
        password='adminpass123',
        full_name='Admin User',
        role='admin',
    )


@pytest.fixture
def patient_user(db):
    return User.objects.create_user(
        email='patient10@test.com',
        password='testpass123',
        full_name='Test Patient',
        role='patient',
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def patient_client(api_client, patient_user):
    api_client.force_authenticate(user=patient_user)
    return api_client


# ── Health Check ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_health_check_returns_ok_when_database_reachable(api_client):
    url = reverse('health-check')
    response = api_client.get(url)  # no auth token
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'
    assert data['database'] == 'ok'


# ── Audit Log List ────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_admin_can_view_audit_logs(admin_client, admin_user):
    AuditLog.objects.create(user=admin_user, action='LOGIN_SUCCESS', ip_address='127.0.0.1')
    url = reverse('audit-log-list')
    response = admin_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.django_db
def test_non_admin_cannot_view_audit_logs(patient_client):
    url = reverse('audit-log-list')
    response = patient_client.get(url)
    assert response.status_code == 403


@pytest.mark.django_db
def test_audit_logs_can_be_filtered_by_action_type(admin_client, admin_user, patient_user):
    AuditLog.objects.create(user=admin_user, action='LOGIN_SUCCESS', ip_address='127.0.0.1')
    AuditLog.objects.create(user=patient_user, action='APPOINTMENT_BOOKED', ip_address='127.0.0.2')
    url = reverse('audit-log-list')
    response = admin_client.get(url, {'action': 'LOGIN_SUCCESS'})
    assert response.status_code == 200
    data = response.json()
    assert all(entry['action'] == 'LOGIN_SUCCESS' for entry in data)
    assert any(entry['user_email'] == admin_user.email for entry in data)


@pytest.mark.django_db
def test_audit_logs_limited_to_most_recent_100(admin_client, admin_user):
    # Create 110 entries; expect only 100 returned, newest first
    logs = [
        AuditLog(user=admin_user, action='LOGIN_SUCCESS', ip_address='127.0.0.1')
        for _ in range(110)
    ]
    AuditLog.objects.bulk_create(logs)
    url = reverse('audit-log-list')
    response = admin_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == 100
