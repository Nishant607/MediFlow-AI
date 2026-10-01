from rest_framework import serializers
from apps.appointments.models import Appointment
from apps.doctors.models import DoctorProfile
from apps.patients.models import PatientProfile
from apps.users.serializers import DoctorProfileSerializer, PatientProfileSerializer
from apps.appointments.services import is_slot_bookable


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)
    patient = PatientProfileSerializer(read_only=True)
    doctor_detail = serializers.SerializerMethodField()
    patient_detail = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = (
            'id',
            'patient',
            'doctor',
            'doctor_detail',
            'patient_detail',
            'appointment_date',
            'appointment_time',
            'status',
            'reason',
            'created_at',
            'updated_at'
        )

    def get_doctor_detail(self, obj):
        if not obj.doctor:
            return None
        doc_user_name = obj.doctor.user.full_name if obj.doctor.user else ''
        dept_name = obj.doctor.department.name if obj.doctor.department else ''
        return {
            'user_full_name': doc_user_name,
            'department_name': dept_name,
            'specialization': obj.doctor.specialization or ''
        }

    def get_patient_detail(self, obj):
        if not obj.patient:
            return None
        patient_user_name = obj.patient.user.full_name if obj.patient.user else ''
        return {
            'user_full_name': patient_user_name
        }


class AppointmentCreateSerializer(serializers.ModelSerializer):
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=DoctorProfile.objects.filter(is_approved=True),
        source='doctor',
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = ('id', 'doctor_id', 'appointment_date', 'appointment_time', 'reason')

    def validate(self, attrs):
        doctor = attrs.get('doctor')
        target_date = attrs.get('appointment_date')
        target_time = attrs.get('appointment_time')

        is_valid, error_reason = is_slot_bookable(doctor, target_date, target_time)
        if not is_valid:
            raise serializers.ValidationError({"detail": error_reason})

        return attrs
