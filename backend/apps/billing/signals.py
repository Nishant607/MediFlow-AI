from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.medical_records.models import Prescription
from apps.billing.models import Invoice, InvoiceItem
from apps.billing.constants import CONSULTATION_FEE


@receiver(post_save, sender=Prescription)
def create_invoice_for_completed_consultation(sender, instance, created, **kwargs):
    if created:
        invoice = Invoice.objects.create(
            appointment=instance.appointment,
            patient=instance.patient
        )
        InvoiceItem.objects.create(
            invoice=invoice,
            description='Consultation Fee',
            amount=CONSULTATION_FEE
        )
        from apps.notifications.tasks import send_invoice_generated_notification
        send_invoice_generated_notification.delay(invoice.id)
