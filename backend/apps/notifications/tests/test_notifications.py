from datetime import timedelta
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department
from apps.appointments.models import Appointment
from apps.billing.models import Invoice, InvoiceItem
from apps.notifications.models import Notification
from apps.notifications.tasks import send_appointment_reminders


@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class NotificationsTests(TestCase):
    def setUp(self):
        self.dept, _ = Department.objects.get_or_create(
            name='Pediatrics',
            defaults={'description': 'Child health'}
        )

        self.patient_user1 = User.objects.create_user(
            email='pat1@example.com',
            password='password123',
            role='patient',
            full_name='Patient Alpha'
        )
        self.patient_profile1 = PatientProfile.objects.create(
            user=self.patient_user1,
            date_of_birth='1995-05-05',
            gender='M',
            phone='1112223333'
        )

        self.patient_user2 = User.objects.create_user(
            email='pat2@example.com',
            password='password123',
            role='patient',
            full_name='Patient Beta'
        )
        self.patient_profile2 = PatientProfile.objects.create(
            user=self.patient_user2,
            date_of_birth='1998-08-08',
            gender='F',
            phone='4445556666'
        )

        self.doctor_user = User.objects.create_user(
            email='doc@example.com',
            password='password123',
            role='doctor',
            full_name='Dr. Adams'
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            department=self.dept,
            specialization='Pediatrician',
            experience_years=8,
            qualification='MD',
            available_time='09:00-17:00',
            is_approved=True
        )

        self.admin_user = User.objects.create_user(
            email='admin_notif@example.com',
            password='password123',
            role='admin',
            full_name='Admin Notif'
        )

        self.client_patient1 = APIClient()
        self.client_patient1.force_authenticate(user=self.patient_user1)

        self.client_patient2 = APIClient()
        self.client_patient2.force_authenticate(user=self.patient_user2)

        self.client_admin = APIClient()
        self.client_admin.force_authenticate(user=self.admin_user)

    def test_notification_created_when_appointment_booked(self):
        Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date='2026-10-10',
            appointment_time='10:00',
            status='SCHEDULED'
        )

        notif = Notification.objects.filter(
            user=self.patient_user1,
            notification_type='APPOINTMENT_BOOKED'
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn('confirmed', notif.message)
        self.assertIn('Dr. Adams', notif.message)

    def test_notification_created_when_appointment_cancelled(self):
        appt = Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date='2026-10-10',
            appointment_time='10:00',
            status='SCHEDULED'
        )
        appt.status = 'CANCELLED'
        appt.save()

        notif = Notification.objects.filter(
            user=self.patient_user1,
            notification_type='APPOINTMENT_CANCELLED'
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn('cancelled', notif.message)

    def test_notification_created_when_invoice_generated(self):
        appt = Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date='2026-10-10',
            appointment_time='10:00',
            status='SCHEDULED'
        )
        invoice = Invoice.objects.create(appointment=appt, patient=self.patient_profile1)
        InvoiceItem.objects.create(invoice=invoice, description='Fee', amount=500)

        # Trigger notification task directly or via signal
        from apps.notifications.tasks import send_invoice_generated_notification
        send_invoice_generated_notification(invoice.id)

        notif = Notification.objects.filter(
            user=self.patient_user1,
            notification_type='INVOICE_GENERATED'
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn('generated', notif.message)

    def test_patient_can_list_own_notifications(self):
        Notification.objects.create(
            user=self.patient_user1,
            notification_type='APPOINTMENT_BOOKED',
            message='Test message'
        )
        res = self.client_patient1.get('/api/notifications/mine/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_user_cannot_list_another_users_notifications(self):
        Notification.objects.create(
            user=self.patient_user1,
            notification_type='APPOINTMENT_BOOKED',
            message='Patient 1 message'
        )
        res = self.client_patient2.get('/api/notifications/mine/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_mark_single_notification_as_read(self):
        notif = Notification.objects.create(
            user=self.patient_user1,
            notification_type='APPOINTMENT_BOOKED',
            message='Test message',
            is_read=False
        )

        # Patient 2 trying to mark Patient 1's notification read -> 404
        res_fail = self.client_patient2.patch(f'/api/notifications/{notif.id}/read/')
        self.assertEqual(res_fail.status_code, status.HTTP_404_NOT_FOUND)

        # Patient 1 marks own notification read -> 200 OK
        res = self.client_patient1.patch(f'/api/notifications/{notif.id}/read/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_mark_all_notifications_as_read(self):
        Notification.objects.create(user=self.patient_user1, notification_type='APPOINTMENT_BOOKED', message='Msg 1', is_read=False)
        Notification.objects.create(user=self.patient_user1, notification_type='APPOINTMENT_CANCELLED', message='Msg 2', is_read=False)

        res = self.client_patient1.post('/api/notifications/mark-all-read/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)
        unread = Notification.objects.filter(user=self.patient_user1, is_read=False).count()
        self.assertEqual(unread, 0)

    def test_admin_can_manually_trigger_reminders(self):
        res = self.client_admin.post('/api/notifications/trigger-reminders/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('Reminders sent for', res.data['message'])

    def test_reminder_only_created_for_tomorrows_scheduled_appointments(self):
        today = timezone.localtime().date()
        tomorrow = today + timedelta(days=1)
        day_after = today + timedelta(days=2)

        # Tomorrow scheduled (should trigger reminder)
        Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date=tomorrow,
            appointment_time='09:00',
            status='SCHEDULED'
        )

        # Today scheduled (should NOT trigger reminder)
        Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date=today,
            appointment_time='09:00',
            status='SCHEDULED'
        )

        # Day after scheduled (should NOT trigger reminder)
        Appointment.objects.create(
            patient=self.patient_profile2,
            doctor=self.doctor_profile,
            appointment_date=day_after,
            appointment_time='09:00',
            status='SCHEDULED'
        )

        count = send_appointment_reminders()
        self.assertEqual(count, 1)

        reminders = Notification.objects.filter(notification_type='APPOINTMENT_REMINDER')
        self.assertEqual(reminders.count(), 1)
        self.assertEqual(reminders.first().user, self.patient_user1)

    def test_reminder_skips_cancelled_and_completed_appointments(self):
        tomorrow = timezone.localtime().date() + timedelta(days=1)

        # Cancelled tomorrow
        Appointment.objects.create(
            patient=self.patient_profile1,
            doctor=self.doctor_profile,
            appointment_date=tomorrow,
            appointment_time='09:00',
            status='CANCELLED'
        )

        # Completed tomorrow
        Appointment.objects.create(
            patient=self.patient_profile2,
            doctor=self.doctor_profile,
            appointment_date=tomorrow,
            appointment_time='10:00',
            status='COMPLETED'
        )

        count = send_appointment_reminders()
        self.assertEqual(count, 0)

    def test_non_admin_cannot_trigger_reminders(self):
        res = self.client_patient1.post('/api/notifications/trigger-reminders/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
