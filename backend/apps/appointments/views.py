from datetime import datetime
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response

from apps.appointments.models import Appointment
from apps.appointments.serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer
)
from apps.users.permissions import IsPatient, IsDoctor, IsApprovedDoctor, IsAdmin
from apps.audit.models import AuditLog
from apps.audit.signals import get_client_ip


class AppointmentCreateView(generics.CreateAPIView):
    permission_classes = [IsPatient]
    serializer_class = AppointmentCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient_profile = request.user.patient_profile
        doctor = serializer.validated_data['doctor']
        appointment_date = serializer.validated_data['appointment_date']
        appointment_time = serializer.validated_data['appointment_time']
        reason = serializer.validated_data.get('reason', '')

        try:
            with transaction.atomic():
                appointment = Appointment.objects.create(
                    patient=patient_profile,
                    doctor=doctor,
                    appointment_date=appointment_date,
                    appointment_time=appointment_time,
                    reason=reason,
                    status='SCHEDULED'
                )

                # Record Audit Log
                ip = get_client_ip(request)
                AuditLog.objects.create(
                    user=request.user,
                    action='APPOINTMENT_BOOKED',
                    ip_address=ip
                )

        except IntegrityError:
            return Response(
                {"detail": "This slot was just booked by someone else, please choose another."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "Appointment booked successfully.",
                "appointment": AppointmentSerializer(appointment).data
            },
            status=status.HTTP_201_CREATED
        )


class MyAppointmentsView(generics.ListAPIView):
    permission_classes = [IsPatient]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        patient_profile = self.request.user.patient_profile
        queryset = Appointment.objects.filter(patient=patient_profile).select_related('doctor__user', 'doctor__department')
        
        filter_param = self.request.query_params.get('filter')
        today = timezone.localtime().date()

        if filter_param == 'upcoming':
            # Upcoming: date in future OR (date is today AND status=SCHEDULED)
            queryset = queryset.filter(status='SCHEDULED', appointment_date__gte=today)
        elif filter_param == 'past':
            # Past: date in past OR status != SCHEDULED
            queryset = queryset.filter(appointment_date__lt=today) | queryset.exclude(status='SCHEDULED')

        return queryset.order_by('-appointment_date', '-appointment_time')


class DoctorScheduleView(generics.ListAPIView):
    permission_classes = [IsApprovedDoctor]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        doctor_profile = self.request.user.doctor_profile
        date_str = self.request.query_params.get('date')

        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = timezone.localtime().date()
        else:
            target_date = timezone.localtime().date()

        return Appointment.objects.filter(
            doctor=doctor_profile,
            appointment_date=target_date,
            status='SCHEDULED'
        ).select_related('patient__user').order_by('appointment_time')


class CancelAppointmentView(views.APIView):
    permission_classes = [IsPatient | IsDoctor | IsAdmin]

    def patch(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)

        # Enforce strict ownership / authorization check
        user = request.user
        is_owner_patient = (user.role == 'patient' and hasattr(user, 'patient_profile') and appointment.patient == user.patient_profile)
        is_tied_doctor = (user.role == 'doctor' and hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile)
        is_admin = (user.role == 'admin' or user.is_staff)

        if not (is_owner_patient or is_tied_doctor or is_admin):
            return Response(
                {"detail": "You do not have permission to cancel this appointment."},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.status == 'CANCELLED':
            return Response(
                {"detail": "This appointment has already been cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if appointment.status == 'COMPLETED':
            return Response(
                {"detail": "Completed appointments cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = 'CANCELLED'
        appointment.save()

        # Record AuditLog
        ip = get_client_ip(request)
        AuditLog.objects.create(
            user=request.user,
            action='APPOINTMENT_CANCELLED',
            ip_address=ip
        )

        return Response(
            {
                "message": "Appointment cancelled successfully.",
                "appointment": AppointmentSerializer(appointment).data
            },
            status=status.HTTP_200_OK
        )


class DoctorPatientCountView(views.APIView):
    permission_classes = [IsApprovedDoctor]

    def get(self, request):
        doctor_profile = request.user.doctor_profile
        total_patients_seen = Appointment.objects.filter(
            doctor=doctor_profile
        ).values('patient').distinct().count()
        return Response({"total_patients_seen": total_patients_seen}, status=status.HTTP_200_OK)
