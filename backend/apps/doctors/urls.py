from django.urls import path
from apps.doctors.views import (
    DoctorListView,
    PendingDoctorListView,
    DoctorAvailableSlotsView,
    ApproveDoctorView
)

urlpatterns = [
    path('', DoctorListView.as_view(), name='doctor-list'),
    path('pending/', PendingDoctorListView.as_view(), name='doctor-pending-list'),
    path('<int:pk>/available-slots/', DoctorAvailableSlotsView.as_view(), name='doctor-available-slots'),
    path('<int:pk>/approve/', ApproveDoctorView.as_view(), name='doctor-approve'),
]
