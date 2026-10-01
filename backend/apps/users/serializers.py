from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name', 'description')


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ('id', 'date_of_birth', 'gender', 'phone')


class DoctorProfileSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    user_detail = serializers.SerializerMethodField()
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = DoctorProfile
        fields = (
            'id',
            'specialization',
            'experience_years',
            'qualification',
            'department',
            'department_id',
            'department_detail',
            'user_detail',
            'available_time',
            'is_approved'
        )

    def get_user_detail(self, obj):
        if not hasattr(obj, 'user') or obj.user is None:
            return None
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.full_name,
        }


class PatientRegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(write_only=True, required=False, allow_null=True)
    gender = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password', 'phone', 'date_of_birth', 'gender')
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        date_of_birth = validated_data.pop('date_of_birth', None)
        gender = validated_data.pop('gender', '')
        
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                full_name=validated_data.get('full_name', ''),
                role='patient'
            )
            PatientProfile.objects.create(
                user=user,
                phone=phone,
                date_of_birth=date_of_birth,
                gender=gender
            )
        return user


class DoctorRegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', write_only=True)
    specialization = serializers.CharField(write_only=True)
    experience_years = serializers.IntegerField(write_only=True, default=0)
    qualification = serializers.CharField(write_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    available_time = serializers.CharField(write_only=True, required=False, default='Mon-Sat, 9AM-5PM')

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password', 'specialization', 'experience_years', 'qualification', 'department', 'available_time')
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }

    def create(self, validated_data):
        specialization = validated_data.pop('specialization')
        experience_years = validated_data.pop('experience_years', 0)
        qualification = validated_data.pop('qualification')
        department = validated_data.pop('department', None)
        available_time = validated_data.pop('available_time', 'Mon-Sat, 9AM-5PM')

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                full_name=validated_data.get('full_name', ''),
                role='doctor',
                is_active=True
            )
            DoctorProfile.objects.create(
                user=user,
                specialization=specialization,
                experience_years=experience_years,
                qualification=qualification,
                department=department,
                available_time=available_time,
                is_approved=False
            )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['role'] = user.role

        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            token['is_approved'] = user.doctor_profile.is_approved
        else:
            token['is_approved'] = True

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserMeSerializer(self.user).data
        return data


class UserMeSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(read_only=True)
    doctor_profile = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'role', 'is_active', 'created_at', 'patient_profile', 'doctor_profile')
