from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.utils import timezone

from apps.users.serializers import (
    PatientRegisterSerializer,
    DoctorRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserMeSerializer
)
from apps.users.permissions import IsAdmin
from apps.users.throttles import RegistrationThrottle
from django.db.models import Sum
from apps.billing.models import Invoice, InvoiceItem
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.appointments.models import Appointment


class PatientRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegistrationThrottle]
    serializer_class = PatientRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "message": "Patient registration successful.",
                "user": UserMeSerializer(user).data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class DoctorRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegistrationThrottle]
    serializer_class = DoctorRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "message": "Registration successful. Your account is pending admin approval.",
                "user": UserMeSerializer(user).data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class LoginThrottle(AnonRateThrottle):
    rate = '5/minute'


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginThrottle]

    def post(self, request, *args, **kwargs):
        # Auto-seed demo accounts on first login attempt if they do not exist yet
        email = request.data.get('email', '').strip().lower()
        if email and ('mediflow.ai' in email):
            from apps.users.models import User
            if not User.objects.filter(email='admin@mediflow.ai').exists():
                try:
                    from django.core.management import call_command
                    call_command('seed_demo_data')
                except Exception as seed_err:
                    import logging
                    logging.getLogger(__name__).warning("Auto-seed error: %s", seed_err)

        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            user_login_failed.send(
                sender=None,
                credentials=request.data,
                request=request
            )
            raise exc

        user = serializer.user
        user_logged_in.send(sender=user.__class__, request=request, user=user)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class UserMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMeSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        full_name = request.data.get('full_name')
        if full_name:
            user.full_name = full_name
            user.save()

        # Update patient profile if provided
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            profile = user.patient_profile
            phone = request.data.get('phone')
            dob = request.data.get('date_of_birth') or request.data.get('dob')
            gender = request.data.get('gender')
            if phone is not None:
                profile.phone = phone
            if dob:
                profile.date_of_birth = dob
            if gender is not None:
                profile.gender = gender
            profile.save()

        # Update doctor profile if provided
        elif user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            profile = user.doctor_profile
            specialization = request.data.get('specialization')
            available_time = request.data.get('available_time')
            if specialization:
                profile.specialization = specialization
            if available_time:
                profile.available_time = available_time
            profile.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminStatsView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.localtime().date()

        revenue_sum = InvoiceItem.objects.filter(
            invoice__status='PAID'
        ).aggregate(total=Sum('amount'))['total'] or 0

        stats = {
            "total_patients": PatientProfile.objects.count(),
            "total_approved_doctors": DoctorProfile.objects.filter(is_approved=True).count(),
            "pending_doctor_approvals": DoctorProfile.objects.filter(is_approved=False).count(),
            "total_appointments": Appointment.objects.count(),
            "todays_appointments": Appointment.objects.filter(appointment_date=today, status='SCHEDULED').count(),
            "total_revenue": f"{revenue_sum:.2f}",
            "pending_invoices_count": Invoice.objects.filter(status='PENDING').count(),
        }
        return Response(stats, status=status.HTTP_200_OK)
