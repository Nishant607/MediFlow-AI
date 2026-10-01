from django.contrib import admin
from apps.medical_records.models import MedicalReport, Prescription


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'patient', 'report_date', 'uploaded_at')
    search_fields = ('title', 'patient__user__full_name', 'patient__user__email')
    list_filter = ('uploaded_at', 'report_date')


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'doctor', 'patient', 'created_at')
    search_fields = ('doctor__user__full_name', 'patient__user__full_name')
    list_filter = ('created_at',)
