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


class UserMeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMeSerializer

    def get_object(self):
        return self.request.user


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
