from django.contrib import admin
from .models import PatientProfile


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone', 'date_of_birth', 'gender')
    search_fields = ('user__email', 'user__full_name', 'phone')
