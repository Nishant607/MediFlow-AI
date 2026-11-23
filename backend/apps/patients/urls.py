from django.urls import path
from apps.patients.views import AdminPatientListView

urlpatterns = [
    path('', AdminPatientListView.as_view(), name='admin-patient-list'),
]
