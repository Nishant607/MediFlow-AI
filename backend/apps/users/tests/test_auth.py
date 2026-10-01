import pytest
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.audit.models import AuditLog
from apps.users.permissions import IsPatient, IsDoctor, IsAdmin, IsApprovedDoctor


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def department(db):
    dept, _ = Department.objects.get_or_create(
        name='Cardiology',
        defaults={'description': 'Cardiology department'}
    )
    return dept


@pytest.mark.django_db
def test_patient_registration_success(api_client):
    payload = {
        'email': 'patient@example.com',
        'name': 'Jane Patient',
        'password': 'password123',
        'phone': '1234567890',
        'date_of_birth': '1990-01-01',
        'gender': 'female'
    }
    response = api_client.post('/api/auth/register/patient/', payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['message'] == 'Patient registration successful.'
    
    user = User.objects.get(email='patient@example.com')
    assert user.role == 'patient'
    assert user.full_name == 'Jane Patient'
    assert PatientProfile.objects.filter(user=user, phone='1234567890').exists()


@pytest.mark.django_db
def test_patient_registration_duplicate_email_fails(api_client):
    payload = {
        'email': 'patient@example.com',
        'name': 'Jane Patient',
        'password': 'password123'
    }
    response1 = api_client.post('/api/auth/register/patient/', payload)
    assert response1.status_code == status.HTTP_201_CREATED

    response2 = api_client.post('/api/auth/register/patient/', payload)
    assert response2.status_code == status.HTTP_400_BAD_REQUEST
    assert 'email' in response2.data


@pytest.mark.django_db
def test_doctor_registration_creates_unapproved_doctor_by_default(api_client, department):
    payload = {
        'email': 'doctor@example.com',
        'name': 'Dr. Smith',
        'password': 'password123',
        'specialization': 'Cardiologist',
        'experience_years': 5,
        'qualification': 'MD',
        'department': department.id,
        'available_time': 'Mon-Fri, 9AM-5PM'
    }
    response = api_client.post('/api/auth/register/doctor/', payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['message'] == 'Registration successful. Your account is pending admin approval.'

    user = User.objects.get(email='doctor@example.com')
    assert user.role == 'doctor'
    doctor_profile = DoctorProfile.objects.get(user=user)
    assert doctor_profile.is_approved is False
    assert doctor_profile.specialization == 'Cardiologist'


@pytest.mark.django_db
def test_login_success_returns_jwt_containing_role_claim(api_client):
    User.objects.create_user(
        email='user@example.com',
        password='password123',
        full_name='Test User',
        role='patient'
    )
    payload = {
        'email': 'user@example.com',
        'password': 'password123'
    }
    response = api_client.post('/api/auth/login/', payload)
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data

    access_token_str = response.data['access']
    decoded_token = AccessToken(access_token_str)
    assert decoded_token['role'] == 'patient'
    assert decoded_token['email'] == 'user@example.com'


@pytest.mark.django_db
def test_login_wrong_password_fails(api_client):
    User.objects.create_user(
        email='user@example.com',
        password='password123',
        full_name='Test User',
        role='patient'
    )
    payload = {
        'email': 'user@example.com',
        'password': 'wrongpassword'
    }
    response = api_client.post('/api/auth/login/', payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_login_throttling_blocks_after_repeated_failed_attempts(api_client):
    payload = {
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    }
    # Perform 5 requests (allowed)
    for _ in range(5):
        api_client.post('/api/auth/login/', payload)

    # 6th request should trigger throttle (429)
    response = api_client.post('/api/auth/login/', payload)
    assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
def test_permission_classes():
    factory = APIRequestFactory()

    patient_user = User.objects.create_user(email='p@ex.com', password='p', full_name='P', role='patient')
    doctor_user = User.objects.create_user(email='d@ex.com', password='p', full_name='D', role='doctor')
    admin_user = User.objects.create_user(email='a@ex.com', password='p', full_name='A', role='admin')
    
    DoctorProfile.objects.create(
        user=doctor_user,
        specialization='Neuro',
        experience_years=2,
        qualification='MD',
        is_approved=False
    )

    approved_doc_user = User.objects.create_user(email='ad@ex.com', password='p', full_name='AD', role='doctor')
    DoctorProfile.objects.create(
        user=approved_doc_user,
        specialization='Ortho',
        experience_years=8,
        qualification='MD',
        is_approved=True
    )

    class DummyView(APIView):
        pass

    view = DummyView()

    # IsPatient check
    req = factory.get('/')
    req.user = patient_user
    assert IsPatient().has_permission(req, view) is True
    req.user = doctor_user
    assert IsPatient().has_permission(req, view) is False

    # IsDoctor check
    req.user = doctor_user
    assert IsDoctor().has_permission(req, view) is True
    req.user = patient_user
    assert IsDoctor().has_permission(req, view) is False

    # IsAdmin check
    req.user = admin_user
    assert IsAdmin().has_permission(req, view) is True
    req.user = patient_user
    assert IsAdmin().has_permission(req, view) is False

    # IsApprovedDoctor check
    req.user = doctor_user
    assert IsApprovedDoctor().has_permission(req, view) is False
    req.user = approved_doc_user
    assert IsApprovedDoctor().has_permission(req, view) is True


@pytest.mark.django_db
def test_audit_log_created_on_login_success_and_failure(api_client):
    user = User.objects.create_user(
        email='audit@example.com',
        password='password123',
        full_name='Audit User',
        role='patient'
    )

    # Success login
    res1 = api_client.post('/api/auth/login/', {'email': 'audit@example.com', 'password': 'password123'})
    assert res1.status_code == status.HTTP_200_OK
    assert AuditLog.objects.filter(action='LOGIN_SUCCESS', user=user).exists()

    # Failed login
    res2 = api_client.post('/api/auth/login/', {'email': 'audit@example.com', 'password': 'wrongpassword'})
    assert res2.status_code == status.HTTP_401_UNAUTHORIZED
    assert AuditLog.objects.filter(action='LOGIN_FAILED', user=user).exists()


@pytest.mark.django_db
def test_patient_registration_throttling_blocks_excessive_attempts(api_client, department):
    """
    The registration endpoint is throttled to 10/hour.
    After clearing cache in the autouse fixture, POST 11 times with
    invalid payloads — at least the 11th must return HTTP 429.
    """
    url = '/api/auth/register/patient/'
    payload = {
        'email': 'throttle_test@example.com',
        'password': 'ValidPass123!',
        'full_name': 'Throttle Tester',
    }
    last_status = None
    for i in range(11):
        # vary email slightly so we don't hit unique-constraint errors blocking before throttle
        data = {**payload, 'email': f'throttle{i}@example.com'}
        response = api_client.post(url, data, format='json')
        last_status = response.status_code

    assert last_status == status.HTTP_429_TOO_MANY_REQUESTS
