from django.urls import path
from apps.appointments.views import (
    AppointmentCreateView,
    MyAppointmentsView,
    DoctorScheduleView,
    CancelAppointmentView,
    DoctorPatientCountView
)

urlpatterns = [
    path('', AppointmentCreateView.as_view(), name='appointment-create'),
    path('mine/', MyAppointmentsView.as_view(), name='appointment-mine'),
    path('schedule/', DoctorScheduleView.as_view(), name='doctor-schedule'),
    path('my-patient-count/', DoctorPatientCountView.as_view(), name='doctor-patient-count'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='appointment-cancel'),
]
