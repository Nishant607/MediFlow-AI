from django.db import models


class Appointment(models.Model):
    STATUS_CHOICES = (
        ('SCHEDULED', 'Scheduled'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    )

    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    doctor = models.ForeignKey(
        'doctors.DoctorProfile',
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SCHEDULED'
    )
    reason = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['appointment_date', 'appointment_time']
        unique_together = ('doctor', 'appointment_date', 'appointment_time')

    def __str__(self):
        p_name = self.patient.user.full_name
        d_name = self.doctor.user.full_name
        return f"Appointment: Patient {p_name} with Dr. {d_name} on {self.appointment_date} at {self.appointment_time} ({self.status})"
