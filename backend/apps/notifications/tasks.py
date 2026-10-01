from datetime import timedelta
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.billing.models import Invoice
from apps.notifications.models import Notification


@shared_task
def send_appointment_booked_notification(appointment_id):
    try:
        appointment = Appointment.objects.select_related('patient__user', 'doctor__user').get(pk=appointment_id)
    except Appointment.DoesNotExist:
        return

    patient_user = appointment.patient.user
    doctor_name = appointment.doctor.user.full_name
    date_str = appointment.appointment_date
    time_str = appointment.appointment_time

    message = f"Your appointment with Dr. {doctor_name} on {date_str} at {time_str} is confirmed."

    Notification.objects.create(
        user=patient_user,
        notification_type='APPOINTMENT_BOOKED',
        message=message
    )

    send_mail(
        subject="Appointment Confirmation",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient_user.email],
        fail_silently=True
    )


@shared_task
def send_appointment_cancelled_notification(appointment_id):
    try:
        appointment = Appointment.objects.select_related('patient__user', 'doctor__user').get(pk=appointment_id)
    except Appointment.DoesNotExist:
        return

    patient_user = appointment.patient.user
    doctor_name = appointment.doctor.user.full_name
    date_str = appointment.appointment_date
    time_str = appointment.appointment_time

    message = f"Your appointment with Dr. {doctor_name} on {date_str} at {time_str} has been cancelled."

    Notification.objects.create(
        user=patient_user,
        notification_type='APPOINTMENT_CANCELLED',
        message=message
    )

    send_mail(
        subject="Appointment Cancellation",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient_user.email],
        fail_silently=True
    )


@shared_task
def send_invoice_generated_notification(invoice_id):
    try:
        invoice = Invoice.objects.select_related('patient__user', 'appointment').get(pk=invoice_id)
    except Invoice.DoesNotExist:
        return

    patient_user = invoice.patient.user
    total_amount = sum(item.amount for item in invoice.items.all())
    date_str = invoice.appointment.appointment_date

    message = f"An invoice of Rs. {total_amount:.2f} has been generated for your visit on {date_str}."

    Notification.objects.create(
        user=patient_user,
        notification_type='INVOICE_GENERATED',
        message=message
    )

    send_mail(
        subject="Invoice Generated",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient_user.email],
        fail_silently=True
    )


@shared_task
def send_appointment_reminders():
    tomorrow = timezone.localtime().date() + timedelta(days=1)
    appointments = Appointment.objects.filter(
        appointment_date=tomorrow,
        status='SCHEDULED'
    ).select_related('patient__user', 'doctor__user')

    reminders_sent = 0
    for appt in appointments:
        patient_user = appt.patient.user
        doctor_name = appt.doctor.user.full_name
        time_str = appt.appointment_time

        message = f"Reminder: You have an appointment with Dr. {doctor_name} tomorrow at {time_str}."

        Notification.objects.create(
            user=patient_user,
            notification_type='APPOINTMENT_REMINDER',
            message=message
        )

        send_mail(
            subject="Appointment Reminder",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_user.email],
            fail_silently=True
        )
        reminders_sent += 1

    return reminders_sent
