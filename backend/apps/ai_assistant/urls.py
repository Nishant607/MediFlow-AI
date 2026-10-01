from django.urls import path
from apps.ai_assistant.views import (
    ChatView,
    MessageHistoryView,
    DocumentListCreateView,
    ToggleDocumentActiveView,
    DocumentDeleteView,
    ReportSummaryView,
    PatientHistorySummaryView
)

urlpatterns = [
    path('chat/', ChatView.as_view(), name='ai-chat'),
    path('messages/', MessageHistoryView.as_view(), name='ai-messages'),
    path('documents/', DocumentListCreateView.as_view(), name='ai-documents'),
    path('documents/<int:pk>/toggle-active/', ToggleDocumentActiveView.as_view(), name='ai-document-toggle-active'),
    path('documents/<int:pk>/', DocumentDeleteView.as_view(), name='ai-document-delete'),
    path('reports/<int:report_id>/summarize/', ReportSummaryView.as_view(), name='ai-report-summary'),
    path('patients/<int:patient_id>/summary/', PatientHistorySummaryView.as_view(), name='ai-patient-summary'),
]
