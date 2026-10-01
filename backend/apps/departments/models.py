from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class EmergencyContact(models.Model):
    AMBULANCE = 'AMBULANCE'
    EMERGENCY_DEPT = 'EMERGENCY_DEPT'
    HELPLINE = 'HELPLINE'
    OTHER = 'OTHER'

    CONTACT_TYPE_CHOICES = [
        (AMBULANCE, 'Ambulance'),
        (EMERGENCY_DEPT, 'Emergency Department'),
        (HELPLINE, 'Helpline'),
        (OTHER, 'Other'),
    ]

    name = models.CharField(max_length=255)
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPE_CHOICES)
    phone_number = models.CharField(max_length=20)
    description = models.CharField(max_length=255, blank=True, default='')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name} ({self.contact_type})'
