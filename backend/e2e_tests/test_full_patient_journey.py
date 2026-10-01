"""
Full Patient Journey — End-to-End Integration Test
====================================================
Simulates the complete hospital workflow in a single test:

  a. Register patient + doctor
  b. Admin approves the doctor
  c. Patient books an appointment
  d. Booking notification is created
  e. Doctor completes consultation (prescription)
  f. Appointment status → COMPLETED
  g. Invoice auto-created with Consultation Fee (Rs. 500)
  h. Invoice-generated notification is created
  i. Patient pays the invoice → PAID
  j. Patient sends AI chat message (LLM mocked) → Message pair saved

The LLM is mocked via unittest.mock.patch — no real Groq call is made.
"""

import pytest
from unittest.mock import patch
from datetime import date, time

from rest_framework.test import APIClient

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.appointments.models import Appointment
from apps.medical_records.models import Prescription
from apps.billing.models import Invoice, InvoiceItem
from apps.billing.constants import CONSULTATION_FEE
from apps.notifications.models import Notification
from apps.ai_assistant.models import Message


# ─── fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def department(db):
    dept, _ = Department.objects.get_or_create(
        name='General Medicine',
        defaults={'description': 'General'},
    )
    return dept


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='e2e_admin@hospital.test',
        password='adminpass99',
        full_name='E2E Admin',
        role='admin',
        is_staff=True,
    )


# ─── the journey ─────────────────────────────────────────────────────────────

@pytest.mark.django_db(transaction=False)
def test_full_patient_journey(client, department, admin_user):
    """
    Single comprehensive test that walks through every major feature of
    HospitalAI from patient registration to AI chat, asserting correct
    state at each step.
    """

    # ── a. Register patient ───────────────────────────────────────────────────
    patient_payload = {
        'email': 'journey_patient@test.com',
        'password': 'PatientPass123!',
        'name': 'Journey Patient',
    }
    res = client.post('/api/auth/register/patient/', patient_payload, format='json')
    assert res.status_code == 201, f"Patient registration failed: {res.data}"
    patient_user = User.objects.get(email='journey_patient@test.com')
    assert patient_user.role == 'patient'
    patient_profile = PatientProfile.objects.get(user=patient_user)

    # ── a. Register doctor ────────────────────────────────────────────────────
    doctor_payload = {
        'email': 'journey_doctor@test.com',
        'password': 'DoctorPass123!',
        'name': 'Dr Journey',
        'specialization': 'General Physician',
        'department': department.id,
        'qualification': 'MBBS',
    }
    res = client.post('/api/auth/register/doctor/', doctor_payload, format='json')
    assert res.status_code == 201, f"Doctor registration failed: {res.data}"
    doctor_user = User.objects.get(email='journey_doctor@test.com')
    assert doctor_user.role == 'doctor'
    doctor_profile = DoctorProfile.objects.get(user=doctor_user)
    assert doctor_profile.is_approved is False, "Doctor should NOT be approved yet"

    # ── b. Admin approves the doctor ──────────────────────────────────────────
    client.force_authenticate(user=admin_user)
    res = client.patch(f'/api/doctors/{doctor_profile.id}/approve/', format='json')
    assert res.status_code == 200, f"Doctor approval failed: {res.data}"
    doctor_profile.refresh_from_db()
    assert doctor_profile.is_approved is True, "Doctor should be approved now"

    # ── c. Patient books an appointment ──────────────────────────────────────
    # Book for tomorrow via the real API (tests booking validation correctly).
    # We then move the date to today in the DB so the consultation endpoint
    # (which rejects future-dated appointments) can complete the visit.
    client.force_authenticate(user=patient_user)
    from datetime import timedelta
    tomorrow = date.today() + timedelta(days=1)
    appt_payload = {
        'doctor_id': doctor_profile.id,
        'appointment_date': str(tomorrow),
        'appointment_time': '10:00:00',
        'reason': 'Routine check-up for e2e test',
    }
    res = client.post('/api/appointments/', appt_payload, format='json')
    assert res.status_code == 201, f"Appointment booking failed: {res.data}"
    appointment_id = res.data['appointment']['id']
    appointment = Appointment.objects.get(id=appointment_id)
    assert appointment.status == 'SCHEDULED'
    assert appointment.patient == patient_profile
    assert appointment.doctor == doctor_profile

    # ── d. Confirm booking notification was created ───────────────────────────
    # CELERY_TASK_ALWAYS_EAGER=True so the task ran synchronously inline
    booking_notification = Notification.objects.filter(
        user=patient_user,
        notification_type='APPOINTMENT_BOOKED',
    ).first()
    assert booking_notification is not None, "Booking notification must be created"
    assert str(tomorrow) in booking_notification.message

    # Move appointment to today so consultation endpoint accepts it
    appointment.appointment_date = date.today()
    appointment.save(update_fields=['appointment_date'])

    # ── e. Doctor completes consultation (creates Prescription) ───────────────
    client.force_authenticate(user=doctor_user)
    consult_payload = {
        'appointment_id': appointment.id,
        'symptoms': 'Mild headache and fatigue',
        'observations': 'BP normal, no fever',
        'prescription_text': 'Paracetamol 500mg twice daily for 3 days',
    }
    res = client.post('/api/medical-records/consultations/', consult_payload, format='json')
    assert res.status_code == 201, f"Prescription creation failed: {res.data}"
    prescription = Prescription.objects.get(appointment=appointment)
    assert prescription.symptoms == 'Mild headache and fatigue'

    # ── f. Appointment status is COMPLETED ────────────────────────────────────
    appointment.refresh_from_db()
    assert appointment.status == 'COMPLETED', (
        f"Appointment should be COMPLETED after prescription, got: {appointment.status}"
    )

    # ── g. Invoice auto-created with Consultation Fee ─────────────────────────
    # billing signal fires on Prescription post_save
    assert Invoice.objects.filter(appointment=appointment).exists(), (
        "Invoice must be auto-created by billing signal when prescription is saved"
    )
    invoice = Invoice.objects.get(appointment=appointment)
    assert invoice.patient == patient_profile
    assert invoice.status == 'PENDING'

    items = InvoiceItem.objects.filter(invoice=invoice)
    assert items.exists(), "Invoice must have at least one item"
    consultation_item = items.filter(description='Consultation Fee').first()
    assert consultation_item is not None, "Invoice must contain a Consultation Fee item"
    assert consultation_item.amount == CONSULTATION_FEE, (
        f"Expected Rs.{CONSULTATION_FEE}, got Rs.{consultation_item.amount}"
    )

    # ── h. Invoice-generated notification created ─────────────────────────────
    invoice_notification = Notification.objects.filter(
        user=patient_user,
        notification_type='INVOICE_GENERATED',
    ).first()
    assert invoice_notification is not None, "Invoice-generated notification must be created"

    # ── i. Patient pays the invoice ───────────────────────────────────────────
    client.force_authenticate(user=patient_user)
    res = client.post(f'/api/billing/invoices/{invoice.id}/pay/', format='json')
    assert res.status_code == 200, f"Invoice payment failed: {res.data}"
    invoice.refresh_from_db()
    assert invoice.status == 'PAID', "Invoice must be PAID after payment"
    assert invoice.paid_at is not None, "paid_at timestamp must be set"

    # ── j. Patient AI chat (LLM mocked, no real Groq call) ───────────────────
    MOCK_LLM_REPLY = "You should rest and stay hydrated. Consult a doctor if symptoms persist."

    with patch(
        'apps.ai_assistant.views.get_llm_response',
        return_value=MOCK_LLM_REPLY
    ), patch(
        'apps.ai_assistant.views.get_relevant_chunks',
        return_value=['chunk: general health advice for headache and fatigue']
    ):
        chat_payload = {'message': 'What should I do for a headache?'}
        res = client.post('/api/ai-assistant/chat/', chat_payload, format='json')
        assert res.status_code == 200, f"AI chat failed: {res.data}"
        assert res.data['reply'] == MOCK_LLM_REPLY

    # Confirm both user and assistant messages were persisted
    messages = Message.objects.filter(patient=patient_profile).order_by('created_at')
    assert messages.count() == 2, (
        f"Expected 2 messages (user + assistant), got {messages.count()}"
    )
    assert messages[0].role == 'user'
    assert messages[0].content == 'What should I do for a headache?'
    assert messages[1].role == 'assistant'
    assert messages[1].content == MOCK_LLM_REPLY
