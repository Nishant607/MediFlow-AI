from datetime import date, timedelta, time
import pytest
from django.utils import timezone
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.appointments.models import Appointment
from apps.appointments.services import get_available_slots
from apps.audit.models import AuditLog


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def department(db):
    dept, _ = Department.objects.get_or_create(
        name='Cardiology',
        defaults={'description': 'Cardiology department'}
    )
    return dept


@pytest.fixture
def approved_doctor(db, department):
    user = User.objects.create_user(
        email='approved_doc@example.com',
        password='password123',
        full_name='Dr. Approved',
        role='doctor'
    )
    doc = DoctorProfile.objects.create(
        user=user,
        specialization='Cardiologist',
        experience_years=10,
        qualification='MD',
        department=department,
        is_approved=True
    )
    return doc


@pytest.fixture
def unapproved_doctor(db, department):
    user = User.objects.create_user(
        email='unapproved_doc@example.com',
        password='password123',
        full_name='Dr. Unapproved',
        role='doctor'
    )
    doc = DoctorProfile.objects.create(
        user=user,
        specialization='Cardiologist',
        experience_years=2,
        qualification='MD',
        department=department,
        is_approved=False
    )
    return doc


@pytest.fixture
def patient1(db):
    user = User.objects.create_user(
        email='patient1@example.com',
        password='password123',
        full_name='Patient One',
        role='patient'
    )
    profile = PatientProfile.objects.create(user=user, phone='1111111111')
    return profile


@pytest.fixture
def patient2(db):
    user = User.objects.create_user(
        email='patient2@example.com',
        password='password123',
        full_name='Patient Two',
        role='patient'
    )
    profile = PatientProfile.objects.create(user=user, phone='2222222222')
    return profile


def get_next_weekday(target_weekday):
    """Returns next upcoming date with target_weekday (0=Mon, 6=Sun)."""
    today = timezone.localtime().date()
    days_ahead = target_weekday - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return today + timedelta(days=days_ahead)


def get_next_working_day():
    """Returns next upcoming Monday-Saturday date."""
    today = timezone.localtime().date()
    next_day = today + timedelta(days=1)
    if next_day.weekday() == 6:  # Sunday
        next_day += timedelta(days=1)
    return next_day


@pytest.mark.django_db
def test_available_slots_excludes_already_booked_slots(approved_doctor, patient1):
    target_date = get_next_working_day()
    slot_time = time(10, 0)
    
    # Book 10:00 slot
    Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=slot_time,
        status='SCHEDULED'
    )

    result = get_available_slots(approved_doctor, target_date)
    assert result['is_closed'] is False
    slot_10 = next((s for s in result['available_slots'] if s['time'] == '10:00'), None)
    slot_09 = next((s for s in result['available_slots'] if s['time'] == '09:00'), None)
    assert slot_10 is not None and slot_10['available'] is False
    assert slot_09 is not None and slot_09['available'] is True


@pytest.mark.django_db
def test_available_slots_excludes_past_times_for_today(approved_doctor):
    today = timezone.localtime().date()
    if today.weekday() == 6:
        result = get_available_slots(approved_doctor, today)
        assert result['is_closed'] is True
        assert result['message'] == 'Clinic is closed on Sundays.'
    else:
        result = get_available_slots(approved_doctor, today)
        assert result['is_closed'] is False
        now_time = timezone.localtime().time()
        for slot in result['available_slots']:
            slot_h, slot_m = map(int, slot['time'].split(':'))
            slot_t = time(slot_h, slot_m)
            if slot_t <= now_time:
                assert slot['available'] is False


@pytest.mark.django_db
def test_available_slots_empty_on_sunday(approved_doctor):
    next_sunday = get_next_weekday(6)
    result = get_available_slots(approved_doctor, next_sunday)
    assert result['is_closed'] is True
    assert result['available_slots'] == []
    assert result['message'] == 'Clinic is closed on Sundays.'


@pytest.mark.django_db
def test_booking_fails_for_unapproved_doctor(unapproved_doctor, patient1):
    client = APIClient()
    client.force_authenticate(user=patient1.user)

    target_date = get_next_working_day()
    payload = {
        'doctor_id': unapproved_doctor.id,
        'appointment_date': target_date.strftime('%Y-%m-%d'),
        'appointment_time': '10:00',
        'reason': 'Checkup'
    }
    response = client.post('/api/appointments/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_booking_fails_for_past_date(approved_doctor, patient1):
    client = APIClient()
    client.force_authenticate(user=patient1.user)

    past_date = timezone.localtime().date() - timedelta(days=1)
    payload = {
        'doctor_id': approved_doctor.id,
        'appointment_date': past_date.strftime('%Y-%m-%d'),
        'appointment_time': '10:00',
        'reason': 'Checkup'
    }
    response = client.post('/api/appointments/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'past dates' in str(response.data)


@pytest.mark.django_db
def test_booking_fails_for_already_booked_slot_returns_clear_error(approved_doctor, patient1, patient2):
    target_date = get_next_working_day()
    slot_time = time(11, 0)

    # Patient 1 books 11:00
    Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=slot_time,
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=patient2.user)
    payload = {
        'doctor_id': approved_doctor.id,
        'appointment_date': target_date.strftime('%Y-%m-%d'),
        'appointment_time': '11:00',
        'reason': 'Consultation'
    }
    response = client.post('/api/appointments/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_patient_can_only_view_own_appointments(approved_doctor, patient1, patient2):
    target_date = get_next_working_day()

    apt1 = Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(9, 0),
        status='SCHEDULED'
    )
    apt2 = Appointment.objects.create(
        patient=patient2,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(9, 30),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.get('/api/appointments/mine/')
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results') if isinstance(response.data, dict) else response.data
    apt_ids = [a['id'] for a in results]
    assert apt1.id in apt_ids
    assert apt2.id not in apt_ids
    # Verify doctor_detail and patient_detail fields
    apt_item = next(a for a in results if a['id'] == apt1.id)
    assert apt_item['doctor_detail']['user_full_name'] == 'Dr. Approved'
    assert apt_item['doctor_detail']['department_name'] == 'Cardiology'
    assert apt_item['patient_detail']['user_full_name'] == 'Patient One'


@pytest.mark.django_db
def test_doctor_can_only_view_own_schedule(approved_doctor, department, patient1):
    other_doc_user = User.objects.create_user(
        email='other_doc@example.com',
        password='password123',
        full_name='Dr. Other',
        role='doctor'
    )
    other_doc = DoctorProfile.objects.create(
        user=other_doc_user,
        specialization='Neurologist',
        experience_years=5,
        qualification='MD',
        department=department,
        is_approved=True
    )

    target_date = get_next_working_day()
    apt_mine = Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )
    apt_other = Appointment.objects.create(
        patient=patient1,
        doctor=other_doc,
        appointment_date=target_date,
        appointment_time=time(10, 30),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=approved_doctor.user)

    response = client.get(f'/api/appointments/schedule/?date={target_date.strftime("%Y-%m-%d")}')
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results') if isinstance(response.data, dict) else response.data
    apt_ids = [a['id'] for a in results]
    assert apt_mine.id in apt_ids
    assert apt_other.id not in apt_ids


@pytest.mark.django_db
def test_patient_can_cancel_own_scheduled_appointment(approved_doctor, patient1):
    target_date = get_next_working_day()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(14, 0),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.patch(f'/api/appointments/{apt.id}/cancel/')
    assert response.status_code == status.HTTP_200_OK
    apt.refresh_from_db()
    assert apt.status == 'CANCELLED'

    assert AuditLog.objects.filter(action='APPOINTMENT_CANCELLED').exists()


@pytest.mark.django_db
def test_patient_cannot_cancel_another_patients_appointment(approved_doctor, patient1, patient2):
    target_date = get_next_working_day()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(15, 0),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=patient2.user)

    response = client.patch(f'/api/appointments/{apt.id}/cancel/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_cannot_cancel_already_cancelled_appointment(approved_doctor, patient1):
    target_date = get_next_working_day()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(16, 0),
        status='CANCELLED'
    )

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.patch(f'/api/appointments/{apt.id}/cancel/')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'already been cancelled' in str(response.data)


@pytest.mark.django_db
def test_doctor_patient_count_returns_distinct_patients(approved_doctor, patient1):
    target_date = get_next_working_day()
    Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )
    Appointment.objects.create(
        patient=patient1,
        doctor=approved_doctor,
        appointment_date=target_date + timedelta(days=1),
        appointment_time=time(11, 0),
        status='COMPLETED'
    )

    client = APIClient()
    client.force_authenticate(user=approved_doctor.user)

    response = client.get('/api/appointments/my-patient-count/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_patients_seen'] == 1
