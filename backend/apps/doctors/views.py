from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.doctors.models import DoctorProfile
from apps.users.serializers import DoctorProfileSerializer
from apps.users.permissions import IsAdmin
from apps.appointments.services import get_available_slots
from apps.audit.models import AuditLog
from apps.audit.signals import get_client_ip


class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = DoctorProfile.objects.filter(is_approved=True).select_related('user', 'department')
        department_id = self.request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        return queryset


class DoctorAvailableSlotsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        doctor = get_object_or_404(DoctorProfile, pk=pk)
        date_str = request.query_params.get('date')
        
        if not date_str:
            target_date = timezone.localtime().date()
        else:
            target_date = date_str

        result = get_available_slots(doctor, target_date)
        return Response(result, status=status.HTTP_200_OK)


class PendingDoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return DoctorProfile.objects.filter(is_approved=False).select_related('user', 'department')


class ApproveDoctorView(views.APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        doctor = get_object_or_404(DoctorProfile, pk=pk)
        doctor.is_approved = True
        doctor.save()

        # Record AuditLog
        ip = get_client_ip(request)
        AuditLog.objects.create(
            user=request.user,
            action='DOCTOR_APPROVED',
            ip_address=ip
        )

        return Response(
            {
                "message": f"Dr. {doctor.user.full_name} has been approved.",
                "doctor": DoctorProfileSerializer(doctor).data
            },
            status=status.HTTP_200_OK
        )
