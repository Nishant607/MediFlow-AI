import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.appointments.models import Appointment
from apps.audit.models import AuditLog


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email='admin_test@example.com',
        password='password123',
        full_name='Admin Test'
    )


@pytest.fixture
def department(db):
    dept, _ = Department.objects.get_or_create(
        name='General Medicine',
        defaults={'description': 'General Medicine'}
    )
    return dept


@pytest.mark.django_db
def test_admin_can_list_pending_doctors_and_approve_one(admin_user, department):
    doc_user = User.objects.create_user(
        email='pending_doc@example.com',
        password='password123',
        full_name='Dr. Pending',
        role='doctor'
    )
    doc_profile = DoctorProfile.objects.create(
        user=doc_user,
        specialization='General',
        experience_years=3,
        qualification='MBBS',
        department=department,
        is_approved=False
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)

    # 1. List pending doctors
    res_list = client.get('/api/doctors/pending/')
    assert res_list.status_code == status.HTTP_200_OK
    results = res_list.data if isinstance(res_list.data, list) else res_list.data.get('results', res_list.data)
    pending_ids = [d['id'] for d in results]
    assert doc_profile.id in pending_ids
    assert results[0]['user_detail']['full_name'] == 'Dr. Pending'
    assert results[0]['department_detail']['name'] == 'General Medicine'

    # 2. Approve doctor
    res_approve = client.patch(f'/api/doctors/{doc_profile.id}/approve/')
    assert res_approve.status_code == status.HTTP_200_OK
    doc_profile.refresh_from_db()
    assert doc_profile.is_approved is True

    # 3. Check AuditLog entry created
    assert AuditLog.objects.filter(action='DOCTOR_APPROVED', user=admin_user).exists()


@pytest.mark.django_db
def test_non_admin_cannot_access_admin_stats_or_approve_endpoints(department):
    patient_user = User.objects.create_user(
        email='patient_norm@example.com',
        password='password123',
        full_name='Normal Patient',
        role='patient'
    )
    doc_user = User.objects.create_user(
        email='doc_norm@example.com',
        password='password123',
        full_name='Dr. Norm',
        role='doctor'
    )
    doc_profile = DoctorProfile.objects.create(
        user=doc_user,
        specialization='General',
        experience_years=1,
        qualification='MBBS',
        department=department,
        is_approved=False
    )

    client = APIClient()
    client.force_authenticate(user=patient_user)

    assert client.get('/api/auth/admin/stats/').status_code == status.HTTP_403_FORBIDDEN
    assert client.get('/api/doctors/pending/').status_code == status.HTTP_403_FORBIDDEN
    assert client.patch(f'/api/doctors/{doc_profile.id}/approve/').status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_admin_stats_returns_correct_counts(admin_user, department):
    # Create 2 Patients
    p1 = User.objects.create_user(email='p1@ex.com', password='p', full_name='P1', role='patient')
    PatientProfile.objects.create(user=p1)
    p2 = User.objects.create_user(email='p2@ex.com', password='p', full_name='P2', role='patient')
    PatientProfile.objects.create(user=p2)

    # Create 1 Approved Doctor, 1 Unapproved Doctor
    d1 = User.objects.create_user(email='d1@ex.com', password='p', full_name='D1', role='doctor')
    doc_approved = DoctorProfile.objects.create(user=d1, specialization='S1', qualification='Q1', department=department, is_approved=True)

    d2 = User.objects.create_user(email='d2@ex.com', password='p', full_name='D2', role='doctor')
    DoctorProfile.objects.create(user=d2, specialization='S2', qualification='Q2', department=department, is_approved=False)

    # Create 1 Appointment for today
    today = timezone.localtime().date()
    Appointment.objects.create(
        patient=p1.patient_profile,
        doctor=doc_approved,
        appointment_date=today,
        appointment_time=timezone.localtime().time(),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.get('/api/auth/admin/stats/')
    assert response.status_code == status.HTTP_200_OK

    data = response.data
    assert data['total_patients'] == 2
    assert data['total_approved_doctors'] == 1
    assert data['pending_doctor_approvals'] == 1
    assert data['total_appointments'] == 1
    assert data['todays_appointments'] == 1
