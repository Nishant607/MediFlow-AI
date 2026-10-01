from rest_framework import serializers
from apps.billing.models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ('id', 'description', 'amount')


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    doctor_detail = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()
    appointment_time = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = (
            'id',
            'appointment_date',
            'appointment_time',
            'doctor_detail',
            'status',
            'items',
            'total_amount',
            'created_at',
            'paid_at'
        )

    def get_total_amount(self, obj):
        total = sum(item.amount for item in obj.items.all())
        return f"{total:.2f}"

    def get_doctor_detail(self, obj):
        doctor = obj.appointment.doctor
        return {
            "user_full_name": doctor.user.full_name,
            "specialization": doctor.specialization
        }

    def get_appointment_date(self, obj):
        return obj.appointment.appointment_date

    def get_appointment_time(self, obj):
        return obj.appointment.appointment_time


class AdminInvoiceSerializer(InvoiceSerializer):
    patient_detail = serializers.SerializerMethodField()

    class Meta(InvoiceSerializer.Meta):
        fields = (
            'id',
            'appointment_date',
            'appointment_time',
            'doctor_detail',
            'patient_detail',
            'status',
            'items',
            'total_amount',
            'created_at',
            'paid_at'
        )

    def get_patient_detail(self, obj):
        return {
            "user_full_name": obj.patient.user.full_name
        }
