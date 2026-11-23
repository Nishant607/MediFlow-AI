from rest_framework import serializers
from apps.patients.models import PatientProfile


class AdminPatientListSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    created_at = serializers.DateTimeField(source='user.created_at', read_only=True)
    total_appointments = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = (
            'id',
            'user_id',
            'full_name',
            'email',
            'phone',
            'date_of_birth',
            'gender',
            'created_at',
            'total_appointments',
        )

    def get_total_appointments(self, obj):
        return getattr(obj, 'appointments_count', obj.appointments.count())
