import io
from datetime import date, timedelta, time
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.appointments.models import Appointment
from apps.medical_records.models import MedicalReport, Prescription
from apps.audit.models import AuditLog


@pytest.fixture
def department(db):
    dept, _ = Department.objects.get_or_create(
        name='General Medicine',
        defaults={'description': 'General Medicine'}
    )
    return dept


@pytest.fixture
def patient1(db):
    user = User.objects.create_user(
        email='p1@example.com',
        password='password123',
        full_name='Patient One',
        role='patient'
    )
    return PatientProfile.objects.create(user=user, phone='1111111111')


@pytest.fixture
def patient2(db):
    user = User.objects.create_user(
        email='p2@example.com',
        password='password123',
        full_name='Patient Two',
        role='patient'
    )
    return PatientProfile.objects.create(user=user, phone='2222222222')


@pytest.fixture
def doctor1(db, department):
    user = User.objects.create_user(
        email='d1@example.com',
        password='password123',
        full_name='Dr. One',
        role='doctor'
    )
    return DoctorProfile.objects.create(
        user=user,
        specialization='General',
        experience_years=5,
        qualification='MD',
        department=department,
        is_approved=True
    )


@pytest.fixture
def doctor2(db, department):
    user = User.objects.create_user(
        email='d2@example.com',
        password='password123',
        full_name='Dr. Two',
        role='doctor'
    )
    return DoctorProfile.objects.create(
        user=user,
        specialization='Neurology',
        experience_years=8,
        qualification='MD',
        department=department,
        is_approved=True
    )


@pytest.mark.django_db
def test_patient_can_upload_report(patient1):
    client = APIClient()
    client.force_authenticate(user=patient1.user)

    file_content = b"PDF dummy content"
    uploaded_file = SimpleUploadedFile("test_report.pdf", file_content, content_type="application/pdf")

    payload = {
        'title': 'Blood Test Results',
        'report_date': '2026-09-01',
        'file': uploaded_file
    }

    response = client.post('/api/medical-records/reports/', payload, format='multipart')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['message'] == 'Report uploaded successfully.'
    assert MedicalReport.objects.filter(patient=patient1, title='Blood Test Results').exists()


@pytest.mark.django_db
def test_report_upload_rejects_invalid_file_extension(patient1):
    client = APIClient()
    client.force_authenticate(user=patient1.user)

    uploaded_file = SimpleUploadedFile(
        "test_script.docx",
        b"dummy docx content",
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    payload = {
        'title': 'Invalid File',
        'file': uploaded_file
    }

    response = client.post('/api/medical-records/reports/', payload, format='multipart')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'file' in response.data or 'detail' in response.data or 'non_field_errors' in response.data


@pytest.mark.django_db
def test_report_upload_rejects_oversized_file(patient1):
    client = APIClient()
    client.force_authenticate(user=patient1.user)

    # 10MB + 1 byte
    large_content = b"0" * (10 * 1024 * 1024 + 1)
    uploaded_file = SimpleUploadedFile("huge_image.png", large_content, content_type="image/png")
    payload = {
        'title': 'Huge Image',
        'file': uploaded_file
    }

    response = client.post('/api/medical-records/reports/', payload, format='multipart')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_patient_can_list_own_reports(patient1, patient2):
    file1 = SimpleUploadedFile("r1.pdf", b"pdf1", content_type="application/pdf")
    file2 = SimpleUploadedFile("r2.pdf", b"pdf2", content_type="application/pdf")

    MedicalReport.objects.create(patient=patient1, title='P1 Report', file=file1)
    MedicalReport.objects.create(patient=patient2, title='P2 Report', file=file2)

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.get('/api/medical-records/reports/mine/')
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results') if isinstance(response.data, dict) else response.data
    assert len(results) == 1
    assert results[0]['title'] == 'P1 Report'


@pytest.mark.django_db
def test_report_download_allowed_for_owner_patient(patient1):
    uploaded_file = SimpleUploadedFile("my_report.pdf", b"PDF file bytes", content_type="application/pdf")
    report = MedicalReport.objects.create(patient=patient1, title='My Report', file=uploaded_file)

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.get(f'/api/medical-records/reports/{report.id}/download/')
    assert response.status_code == status.HTTP_200_OK
    assert b"PDF file bytes" in b"".join(response.streaming_content)


@pytest.mark.django_db
def test_report_download_allowed_for_doctor_with_shared_appointment_history(patient1, doctor1):
    today = timezone.localtime().date()
    Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )

    uploaded_file = SimpleUploadedFile("patient_report.pdf", b"Shared PDF bytes", content_type="application/pdf")
    report = MedicalReport.objects.create(patient=patient1, title='Patient Report', file=uploaded_file)

    client = APIClient()
    client.force_authenticate(user=doctor1.user)

    response = client.get(f'/api/medical-records/reports/{report.id}/download/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_report_download_denied_for_unrelated_doctor(patient1, doctor2):
    uploaded_file = SimpleUploadedFile("secret_report.pdf", b"Secret bytes", content_type="application/pdf")
    report = MedicalReport.objects.create(patient=patient1, title='Secret Report', file=uploaded_file)

    client = APIClient()
    client.force_authenticate(user=doctor2.user)

    response = client.get(f'/api/medical-records/reports/{report.id}/download/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_report_download_denied_for_unrelated_patient(patient1, patient2):
    uploaded_file = SimpleUploadedFile("private.pdf", b"Private bytes", content_type="application/pdf")
    report = MedicalReport.objects.create(patient=patient1, title='Private Report', file=uploaded_file)

    client = APIClient()
    client.force_authenticate(user=patient2.user)

    response = client.get(f'/api/medical-records/reports/{report.id}/download/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_doctor_can_submit_consultation_marks_appointment_completed(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=doctor1.user)

    payload = {
        'appointment_id': apt.id,
        'symptoms': 'Fever and Cough',
        'observations': 'Mild viral infection',
        'prescription_text': 'Paracetamol 500mg twice daily'
    }

    response = client.post('/api/medical-records/consultations/', payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['message'] == 'Consultation completed successfully.'
    
    apt.refresh_from_db()
    assert apt.status == 'COMPLETED'
    assert Prescription.objects.filter(appointment=apt).exists()


@pytest.mark.django_db
def test_consultation_fails_for_future_dated_appointment(patient1, doctor1):
    future_date = timezone.localtime().date() + timedelta(days=1)
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=future_date,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=doctor1.user)

    payload = {
        'appointment_id': apt.id,
        'symptoms': 'Fever',
        'observations': 'Rest',
        'prescription_text': 'Meds'
    }

    response = client.post('/api/medical-records/consultations/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'future-dated' in str(response.data)


@pytest.mark.django_db
def test_consultation_fails_for_already_completed_appointment(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='COMPLETED'
    )

    client = APIClient()
    client.force_authenticate(user=doctor1.user)

    payload = {
        'appointment_id': apt.id,
        'symptoms': 'Fever',
        'observations': 'Rest',
        'prescription_text': 'Meds'
    }

    response = client.post('/api/medical-records/consultations/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_consultation_fails_for_cancelled_appointment(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='CANCELLED'
    )

    client = APIClient()
    client.force_authenticate(user=doctor1.user)

    payload = {
        'appointment_id': apt.id,
        'symptoms': 'Fever',
        'observations': 'Rest',
        'prescription_text': 'Meds'
    }

    response = client.post('/api/medical-records/consultations/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_consultation_fails_for_another_doctors_appointment(patient1, doctor1, doctor2):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )

    client = APIClient()
    client.force_authenticate(user=doctor2.user)

    payload = {
        'appointment_id': apt.id,
        'symptoms': 'Fever',
        'observations': 'Rest',
        'prescription_text': 'Meds'
    }

    response = client.post('/api/medical-records/consultations/', payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'only complete your own appointments' in str(response.data)


@pytest.mark.django_db
def test_completed_appointment_cannot_be_cancelled(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='COMPLETED'
    )

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.patch(f'/api/appointments/{apt.id}/cancel/')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Completed appointments cannot be cancelled' in str(response.data)


@pytest.mark.django_db
def test_patient_can_view_own_prescriptions(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='COMPLETED'
    )
    Prescription.objects.create(
        appointment=apt,
        doctor=doctor1,
        patient=patient1,
        symptoms='Headache',
        observations='Stress',
        prescription_text='Rest'
    )

    client = APIClient()
    client.force_authenticate(user=patient1.user)

    response = client.get('/api/medical-records/consultations/mine/')
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results') if isinstance(response.data, dict) else response.data
    assert len(results) == 1
    assert results[0]['doctor_detail']['user_full_name'] == 'Dr. One'


@pytest.mark.django_db
def test_doctor_can_view_patient_history_with_shared_appointment(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='COMPLETED'
    )
    Prescription.objects.create(
        appointment=apt,
        doctor=doctor1,
        patient=patient1,
        symptoms='Headache',
        observations='Stress',
        prescription_text='Rest'
    )

    client = APIClient()
    client.force_authenticate(user=doctor1.user)

    response = client.get(f'/api/medical-records/consultations/patient/{patient1.id}/')
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results') if isinstance(response.data, dict) else response.data
    assert len(results) == 1


@pytest.mark.django_db
def test_doctor_cannot_view_history_of_unrelated_patient(patient1, doctor2):
    client = APIClient()
    client.force_authenticate(user=doctor2.user)

    response = client.get(f'/api/medical-records/consultations/patient/{patient1.id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_audit_log_created_for_report_upload_and_consultation_completed(patient1, doctor1):
    today = timezone.localtime().date()
    apt = Appointment.objects.create(
        patient=patient1,
        doctor=doctor1,
        appointment_date=today,
        appointment_time=time(10, 0),
        status='SCHEDULED'
    )

    # 1. Report Upload Audit
    client = APIClient()
    client.force_authenticate(user=patient1.user)
    uploaded_file = SimpleUploadedFile("audit_test.pdf", b"data", content_type="application/pdf")
    client.post('/api/medical-records/reports/', {'title': 'Audit Report', 'file': uploaded_file}, format='multipart')

    assert AuditLog.objects.filter(action='REPORT_UPLOADED', user=patient1.user).exists()

    # 2. Consultation Audit
    client.force_authenticate(user=doctor1.user)
    client.post('/api/medical-records/consultations/', {'appointment_id': apt.id, 'symptoms': 'S'})

    assert AuditLog.objects.filter(action='CONSULTATION_COMPLETED', user=doctor1.user).exists()
