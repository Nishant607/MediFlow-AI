from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'created_at')
    list_filter = ('status', 'appointment_date', 'doctor')
    search_fields = ('patient__user__full_name', 'doctor__user__full_name', 'reason')
