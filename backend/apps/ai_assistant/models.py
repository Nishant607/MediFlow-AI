from django.db import models
from django.conf import settings
from apps.ai_assistant.validators import validate_kb_file


class KnowledgeDocument(models.Model):
    CATEGORY_CHOICES = (
        ('FAQ', 'General FAQ'),
        ('APPOINTMENT_POLICY', 'Appointment Policy'),
        ('INSURANCE_POLICY', 'Insurance Policy'),
        ('DEPARTMENT_INFO', 'Department Information'),
        ('EMERGENCY_GUIDELINES', 'Emergency Guidelines'),
        ('OTHER', 'Other'),
    )

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    file = models.FileField(upload_to='knowledge_base/%Y/%m/', validators=[validate_kb_file])
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_kb_documents'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"


class DocumentChunk(models.Model):
    document = models.ForeignKey(
        KnowledgeDocument,
        on_delete=models.CASCADE,
        related_name='chunks'
    )
    chunk_text = models.TextField()
    chunk_index = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chunk {self.chunk_index} for Document #{self.document_id}"


class Message(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
    )

    patient = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='ai_messages'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] Patient #{self.patient_id}: {self.content[:30]}"


class ReportSummary(models.Model):
    report = models.OneToOneField(
        'medical_records.MedicalReport',
        on_delete=models.CASCADE,
        related_name='ai_summary'
    )
    summary_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary for Report #{self.report_id}"
