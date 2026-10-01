from django.contrib import admin
from apps.billing.models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'appointment', 'status', 'created_at', 'paid_at')
    list_filter = ('status', 'created_at')
    search_fields = ('patient__user__email', 'patient__user__full_name')
    inlines = [InvoiceItemInline]


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'description', 'amount')
