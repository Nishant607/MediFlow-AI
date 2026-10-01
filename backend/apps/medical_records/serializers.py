from rest_framework import serializers
from django.utils import timezone
from apps.medical_records.models import MedicalReport, Prescription
from apps.medical_records.validators import validate_report_file
from apps.appointments.models import Appointment


class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ('id', 'title', 'report_date', 'uploaded_at')


class MedicalReportUploadSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)
    file = serializers.FileField(required=True, validators=[validate_report_file])
    report_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = MedicalReport
        fields = ('id', 'title', 'file', 'report_date')

    def validate_file(self, value):
        validate_report_file(value)
        return value


class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_detail = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()
    appointment_time = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = (
            'id',
            'appointment_date',
            'appointment_time',
            'doctor_detail',
            'symptoms',
            'observations',
            'prescription_text',
            'created_at'
        )

    def get_doctor_detail(self, obj):
        if not obj.doctor:
            return None
        doc_name = obj.doctor.user.full_name if obj.doctor.user else ''
        return {
            'user_full_name': doc_name,
            'specialization': obj.doctor.specialization or ''
        }

    def get_appointment_date(self, obj):
        return str(obj.appointment.appointment_date) if obj.appointment else None

    def get_appointment_time(self, obj):
        return str(obj.appointment.appointment_time) if obj.appointment else None


class ConsultationCreateSerializer(serializers.ModelSerializer):
    appointment_id = serializers.PrimaryKeyRelatedField(
        source='appointment',
        queryset=Appointment.objects.all(),
        write_only=True
    )
    symptoms = serializers.CharField(required=False, allow_blank=True, default='')
    observations = serializers.CharField(required=False, allow_blank=True, default='')
    prescription_text = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Prescription
        fields = ('appointment_id', 'symptoms', 'observations', 'prescription_text')

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'doctor_profile'):
            raise serializers.ValidationError({"detail": "Only registered doctors can submit consultations."})

        doctor_profile = request.user.doctor_profile
        appointment = attrs.get('appointment')

        if appointment.doctor != doctor_profile:
            raise serializers.ValidationError({"detail": "You can only complete your own appointments."})

        if appointment.status != 'SCHEDULED':
            raise serializers.ValidationError(
                {"detail": f"This appointment is already {appointment.status.lower()}."}
            )

        today = timezone.localtime().date()
        if appointment.appointment_date > today:
            raise serializers.ValidationError({"detail": "Cannot complete a future-dated appointment."})

        return attrs
