from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from apps.users.permissions import IsPatient, IsAdmin
from apps.billing.models import Invoice
from apps.billing.serializers import InvoiceSerializer, AdminInvoiceSerializer
from apps.audit.models import AuditLog
from apps.audit.signals import get_client_ip


class MyInvoicesView(generics.ListAPIView):
    permission_classes = [IsPatient]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return Invoice.objects.filter(
            patient=self.request.user.patient_profile
        ).order_by('-created_at')


class InvoiceDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()

    def get_object(self):
        invoice = super().get_object()
        user = self.request.user
        is_owner_patient = (
            user.role == 'patient' and
            hasattr(user, 'patient_profile') and
            invoice.patient == user.patient_profile
        )
        is_admin = (user.role == 'admin' or user.is_staff)

        if not (is_owner_patient or is_admin):
            raise PermissionDenied("You do not have permission to view this invoice.")

        return invoice


class PayInvoiceView(views.APIView):
    permission_classes = [IsPatient]

    def post(self, request, pk):
        patient_profile = request.user.patient_profile
        invoice = get_object_or_404(Invoice, pk=pk, patient=patient_profile)

        if invoice.status == 'PAID':
            return Response(
                {"detail": "This invoice is already paid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice.status = 'PAID'
        invoice.paid_at = timezone.now()
        invoice.save()

        # Audit Log
        ip = get_client_ip(request)
        AuditLog.objects.create(
            user=request.user,
            action='INVOICE_PAID',
            ip_address=ip
        )

        return Response(
            {
                "message": "Payment successful.",
                "invoice": InvoiceSerializer(invoice).data
            },
            status=status.HTTP_200_OK
        )


class AllInvoicesView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminInvoiceSerializer
    queryset = Invoice.objects.all().order_by('-created_at')
