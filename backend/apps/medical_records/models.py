from django.db import models
from apps.medical_records.validators import validate_report_file


class MedicalReport(models.Model):
    patient = models.ForeignKey('patients.PatientProfile', on_delete=models.CASCADE, related_name='medical_reports')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='medical_reports/%Y/%m/', validators=[validate_report_file])
    report_date = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        p_name = self.patient.user.full_name if self.patient and self.patient.user else 'Patient'
        return f"Medical Report: {self.title} ({p_name})"


class Prescription(models.Model):
    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='prescription')
    doctor = models.ForeignKey('doctors.DoctorProfile', on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey('patients.PatientProfile', on_delete=models.CASCADE, related_name='prescriptions')
    symptoms = models.TextField(blank=True, default='')
    observations = models.TextField(blank=True, default='')
    prescription_text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        d_name = self.doctor.user.full_name if self.doctor and self.doctor.user else 'Doctor'
        p_name = self.patient.user.full_name if self.patient and self.patient.user else 'Patient'
        return f"Prescription: Dr. {d_name} for {p_name} on {self.created_at.strftime('%Y-%m-%d')}"
