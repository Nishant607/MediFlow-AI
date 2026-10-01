from django.db import models
from django.conf import settings


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    specialization = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField(default=0)
    qualification = models.CharField(max_length=255)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctors'
    )
    available_time = models.CharField(max_length=255, default='Mon-Sat, 9AM-5PM')
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        status = "Approved" if self.is_approved else "Pending Approval"
        return f"Dr. {self.user.full_name} ({self.specialization}) - {status}"
