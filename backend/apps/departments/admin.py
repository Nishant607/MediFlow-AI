from django.contrib import admin
from .models import Department, EmergencyContact


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',)


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'contact_type', 'phone_number', 'description', 'is_active')
    list_filter = ('contact_type', 'is_active')
    search_fields = ('name', 'phone_number')
