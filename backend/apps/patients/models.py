from django.db import models
from django.conf import settings


class PatientProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Patient: {self.user.full_name} ({self.user.email})"
