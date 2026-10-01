from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('LOGIN_SUCCESS', 'Login Success'),
        ('LOGIN_FAILED', 'Login Failed'),
        ('APPOINTMENT_BOOKED', 'Appointment Booked'),
        ('APPOINTMENT_CANCELLED', 'Appointment Cancelled'),
        ('DOCTOR_APPROVED', 'Doctor Approved'),
        ('REPORT_UPLOADED', 'Report Uploaded'),
        ('CONSULTATION_COMPLETED', 'Consultation Completed'),
        ('INVOICE_PAID', 'Invoice Paid'),
        ('KB_DOCUMENT_UPLOADED', 'KB Document Uploaded'),
        ('KB_DOCUMENT_DELETED', 'KB Document Deleted'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_str = self.user.email if self.user else "Anonymous"
        return f"[{self.timestamp}] {user_str} - {self.action} ({self.ip_address})"
