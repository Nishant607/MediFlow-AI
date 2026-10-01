from decimal import Decimal
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.appointments.models import Appointment
from apps.medical_records.models import Prescription
from apps.billing.models import Invoice, InvoiceItem
from apps.audit.models import AuditLog


@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class BillingTests(TestCase):
    def setUp(self):
        self.dept, _ = Department.objects.get_or_create(
            name='Cardiology',
            defaults={'description': 'Heart care'}
        )

        # Patient 1
        self.patient_user1 = User.objects.create_user(
            email='patient1@example.com',
            password='password123',
            role='patient',
            full_name='Patient One'
        )
        self.patient_profile1 = PatientProfile.objects.create(
            user=self.patient_user1,
            date_of_birth='1990-01-01',
            gender='M',
            phone='1234567890'
        )

        # Patient 2
        self.patient_user2 = User.objects.create_user(
            email='patient2@example.com',
            password='password123',
            role='patient',
            full_name='Patient Two'
        )
        self.patient_profile2 = PatientProfile.objects.create(
            user=self.patient_user2,
            date_of_birth='1992-02-02',
            gender='F',
            phone='0987654321'
        )

        # Doctor
        self.doctor_user = User.objects.create_user(
            email='doctor@example.com',
            password='password123',
            role='doctor',
            full_name='Dr. Smith'
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            department=self.dept,
            specialization='Cardiologist',
            experience_years=10,
            qualification='MD',
            available_time='09:00-17:00',
            is_approved=True
        )

        # Admin
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='admin',
            full_name='Admin User'
        )

        # Appointment 1
        self.appointment1 = Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date='2026-09-01',
            appointment_time='10:00',
            status='SCHEDULED'
        )

        self.client_patient1 = APIClient()
        self.client_patient1.force_authenticate(user=self.patient_user1)

        self.client_patient2 = APIClient()
        self.client_patient2.force_authenticate(user=self.patient_user2)

        self.client_admin = APIClient()
        self.client_admin.force_authenticate(user=self.admin_user)

    def test_invoice_auto_created_when_consultation_completed(self):
        Prescription.objects.create(
            appointment=self.appointment1,
            doctor=self.doctor_profile,
            patient=self.patient_profile1,
            symptoms='Chest pain',
            observations='High BP',
            prescription_text='Rest & Meds'
        )

        invoice = Invoice.objects.filter(appointment=self.appointment1).first()
        self.assertIsNotNone(invoice)
        self.assertEqual(invoice.patient, self.patient_profile1)
        self.assertEqual(invoice.status, 'PENDING')
        self.assertEqual(invoice.items.count(), 1)
        item = invoice.items.first()
        self.assertEqual(item.description, 'Consultation Fee')
        self.assertEqual(item.amount, Decimal('500.00'))

    def test_invoice_total_amount_matches_sum_of_items(self):
        invoice = Invoice.objects.create(
            appointment=self.appointment1,
            patient=self.patient_profile1
        )
        InvoiceItem.objects.create(invoice=invoice, description='Fee 1', amount=Decimal('300.00'))
        InvoiceItem.objects.create(invoice=invoice, description='Fee 2', amount=Decimal('200.50'))

        res = self.client_patient1.get(f'/api/billing/invoices/{invoice.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_amount'], '500.50')

    def test_patient_can_view_own_invoices(self):
        Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        res = self.client_patient1.get('/api/billing/invoices/mine/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_patient_cannot_view_another_patients_invoice(self):
        invoice = Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)

        # Patient 2 tries to view Patient 1's invoice -> 403 Forbidden
        res = self.client_patient2.get(f'/api/billing/invoices/{invoice.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Patient 2 tries to pay Patient 1's invoice -> 404 Not Found
        res_pay = self.client_patient2.post(f'/api/billing/invoices/{invoice.id}/pay/')
        self.assertEqual(res_pay.status_code, status.HTTP_404_NOT_FOUND)

    def test_patient_can_pay_pending_invoice(self):
        invoice = Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        InvoiceItem.objects.create(invoice=invoice, description='Consultation Fee', amount=Decimal('500.00'))

        res = self.client_patient1.post(f'/api/billing/invoices/{invoice.id}/pay/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['message'], 'Payment successful.')
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'PAID')
        self.assertIsNotNone(invoice.paid_at)

    def test_cannot_pay_already_paid_invoice(self):
        invoice = Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        self.client_patient1.post(f'/api/billing/invoices/{invoice.id}/pay/')

        # Second attempt
        res = self.client_patient1.post(f'/api/billing/invoices/{invoice.id}/pay/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already paid', res.data['detail'])

    def test_admin_can_view_all_invoices(self):
        Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        res = self.client_admin.get('/api/billing/invoices/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertIn('patient_detail', res.data[0])

    def test_non_owner_non_admin_cannot_view_invoice_detail(self):
        invoice = Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        res = self.client_patient2.get(f'/api/billing/invoices/{invoice.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_stats_includes_total_revenue_and_pending_invoices_count(self):
        invoice1 = Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        InvoiceItem.objects.create(invoice=invoice1, description='Fee', amount=Decimal('500.00'))

        # Pay invoice 1
        self.client_patient1.post(f'/api/billing/invoices/{invoice1.id}/pay/')

        # Create another pending invoice
        appt2 = Appointment.objects.create(
            patient=self.patient_profile2,
            doctor=self.doctor_profile,
            appointment_date='2026-09-02',
            appointment_time='11:00',
            status='SCHEDULED'
        )
        Invoice.objects.create(appointment=appt2, patient=self.patient_profile2)

        res = self.client_admin.get('/api/auth/admin/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_revenue'], '500.00')
        self.assertEqual(res.data['pending_invoices_count'], 1)

    def test_audit_log_created_on_invoice_paid(self):
        invoice = Invoice.objects.create(appointment=self.appointment1, patient=self.patient_profile1)
        self.client_patient1.post(f'/api/billing/invoices/{invoice.id}/pay/')

        log = AuditLog.objects.filter(user=self.patient_user1, action='INVOICE_PAID').first()
        self.assertIsNotNone(log)
