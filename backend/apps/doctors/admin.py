from django.contrib import admin
from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'specialization', 'department', 'experience_years', 'is_approved')
    list_editable = ('is_approved',)
    list_filter = ('is_approved', 'department', 'specialization')
    search_fields = ('user__email', 'user__full_name', 'specialization', 'qualification')
