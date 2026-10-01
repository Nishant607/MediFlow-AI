from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = (
        ('APPOINTMENT_BOOKED', 'Appointment Booked'),
        ('APPOINTMENT_CANCELLED', 'Appointment Cancelled'),
        ('INVOICE_GENERATED', 'Invoice Generated'),
        ('APPOINTMENT_REMINDER', 'Appointment Reminder'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.user.email} - {'Read' if self.is_read else 'Unread'}"
