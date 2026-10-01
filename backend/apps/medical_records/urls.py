from django.urls import path
from apps.medical_records.views import (
    ReportUploadView,
    MyReportsView,
    ReportDownloadView,
    PatientReportsForDoctorView,
    ConsultationCreateView,
    MyPrescriptionsView,
    PatientHistoryForDoctorView
)

urlpatterns = [
    path('reports/', ReportUploadView.as_view(), name='report-upload'),
    path('reports/mine/', MyReportsView.as_view(), name='my-reports'),
    path('reports/<int:pk>/download/', ReportDownloadView.as_view(), name='report-download'),
    path('reports/patient/<int:patient_id>/', PatientReportsForDoctorView.as_view(), name='patient-reports-doctor'),
    path('consultations/', ConsultationCreateView.as_view(), name='consultation-create'),
    path('consultations/mine/', MyPrescriptionsView.as_view(), name='my-prescriptions'),
    path('consultations/patient/<int:patient_id>/', PatientHistoryForDoctorView.as_view(), name='patient-history-doctor'),
]
