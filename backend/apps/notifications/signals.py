from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.appointments.models import Appointment
from apps.notifications.tasks import (
    send_appointment_booked_notification,
    send_appointment_cancelled_notification
)


@receiver(post_save, sender=Appointment)
def appointment_notification_dispatch(sender, instance, created, **kwargs):
    if created:
        send_appointment_booked_notification.delay(instance.id)
    elif instance.status == 'CANCELLED':
        send_appointment_cancelled_notification.delay(instance.id)
