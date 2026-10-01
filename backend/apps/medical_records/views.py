import os
from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from apps.patients.models import PatientProfile
from apps.medical_records.models import MedicalReport, Prescription
from apps.medical_records.serializers import (
    MedicalReportSerializer,
    MedicalReportUploadSerializer,
    PrescriptionSerializer,
    ConsultationCreateSerializer
)
from apps.medical_records.permissions import user_can_access_patient_records
from apps.users.permissions import IsPatient, IsApprovedDoctor
from apps.audit.models import AuditLog
from apps.audit.signals import get_client_ip


class ReportUploadView(generics.CreateAPIView):
    permission_classes = [IsPatient]
    serializer_class = MedicalReportUploadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient_profile = request.user.patient_profile
        report = serializer.save(patient=patient_profile)

        # AuditLog
        ip = get_client_ip(request)
        AuditLog.objects.create(
            user=request.user,
            action='REPORT_UPLOADED',
            ip_address=ip
        )

        return Response(
            {
                "message": "Report uploaded successfully.",
                "report": MedicalReportSerializer(report).data
            },
            status=status.HTTP_201_CREATED
        )


class MyReportsView(generics.ListAPIView):
    permission_classes = [IsPatient]
    serializer_class = MedicalReportSerializer

    def get_queryset(self):
        return MedicalReport.objects.filter(
            patient=self.request.user.patient_profile
        ).order_by('-uploaded_at')


class ReportDownloadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        report = get_object_or_404(MedicalReport, pk=pk)

        if not user_can_access_patient_records(request.user, report.patient):
            return Response(
                {"detail": "You do not have permission to access this report."},
                status=status.HTTP_403_FORBIDDEN
            )

        file_handle = open(report.file.path, 'rb')
        filename = os.path.basename(report.file.name)
        return FileResponse(file_handle, as_attachment=True, filename=filename)


class PatientReportsForDoctorView(generics.ListAPIView):
    permission_classes = [IsApprovedDoctor]
    serializer_class = MedicalReportSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        patient = get_object_or_404(PatientProfile, pk=patient_id)

        if not user_can_access_patient_records(self.request.user, patient):
            raise PermissionDenied("You do not have permission to access this patient's reports.")

        return MedicalReport.objects.filter(patient=patient).order_by('-uploaded_at')


class ConsultationCreateView(generics.CreateAPIView):
    permission_classes = [IsApprovedDoctor]
    serializer_class = ConsultationCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        appointment = serializer.validated_data['appointment']
        symptoms = serializer.validated_data.get('symptoms', '')
        observations = serializer.validated_data.get('observations', '')
        prescription_text = serializer.validated_data.get('prescription_text', '')

        with transaction.atomic():
            prescription = Prescription.objects.create(
                appointment=appointment,
                doctor=request.user.doctor_profile,
                patient=appointment.patient,
                symptoms=symptoms,
                observations=observations,
                prescription_text=prescription_text
            )
            appointment.status = 'COMPLETED'
            appointment.save()

            # AuditLog
            ip = get_client_ip(request)
            AuditLog.objects.create(
                user=request.user,
                action='CONSULTATION_COMPLETED',
                ip_address=ip
            )

        return Response(
            {
                "message": "Consultation completed successfully.",
                "prescription": PrescriptionSerializer(prescription).data
            },
            status=status.HTTP_201_CREATED
        )


class MyPrescriptionsView(generics.ListAPIView):
    permission_classes = [IsPatient]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        return Prescription.objects.filter(
            patient=self.request.user.patient_profile
        ).order_by('-created_at')


class PatientHistoryForDoctorView(generics.ListAPIView):
    permission_classes = [IsApprovedDoctor]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        patient = get_object_or_404(PatientProfile, pk=patient_id)

        if not user_can_access_patient_records(self.request.user, patient):
            raise PermissionDenied("You do not have permission to access this patient's history.")

        return Prescription.objects.filter(patient=patient).order_by('-created_at')
