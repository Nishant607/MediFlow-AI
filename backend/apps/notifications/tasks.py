from datetime import timedelta
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.billing.models import Invoice
from apps.notifications.models import Notification

PORTAL_URL = getattr(settings, 'FRONTEND_URL', 'https://medi-flow-ai-steel.vercel.app')


def _render_email_html(title: str, subtitle: str, badge_text: str, badge_color: str, rows: list[tuple[str, str]], footer_note: str, action_url: str = '', action_text: str = '') -> str:
    """Builds a responsive, beautifully styled clinical HTML email template."""
    rows_html = "".join([
        f"""<tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #475569; width: 38%; border-bottom: 1px solid #f1f5f9; font-size: 14px;">{label}</td>
            <td style="padding: 10px 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9; font-size: 14px;">{value}</td>
        </tr>"""
        for label, value in rows
    ])

    action_btn_html = ""
    if action_url and action_text:
        action_btn_html = f"""
        <div style="text-align: center; margin: 28px 0 16px 0;">
            <a href="{action_url}" style="background-color: #0098A6; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,152,166,0.25);">
                {action_text}
            </a>
        </div>
        """

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
        <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                    <td style="background: linear-gradient(135deg, #007380 0%, #0098A6 100%); padding: 26px 28px; text-align: left;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td>
                                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">MEDIFLOW AI</div>
                                    <div style="font-size: 11px; color: #e0f2fe; margin-top: 3px; font-weight: 500; letter-spacing: 0.25px;">24/7 Clinical Care &amp; Hospital Management</div>
                                </td>
                                <td align="right">
                                    <span style="background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 5px 12px; font-size: 11px; font-weight: 700; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase;">{badge_text}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Content Area -->
                <tr>
                    <td style="padding: 28px 28px 12px 28px;">
                        <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a; font-weight: 700;">{title}</h2>
                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.5;">{subtitle}</p>

                        <!-- Details Table Card -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                {rows_html}
                            </table>
                        </div>

                        {action_btn_html}

                        <!-- Instructions / Note Box -->
                        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; margin-top: 18px;">
                            <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">{footer_note}</p>
                        </div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 500;">
                            Emergency Helpline: <strong>102</strong> &bull; Reception: <strong>+91 (011) 2345-6789</strong> &bull; Email: <a href="mailto:support@mediflow.ai" style="color: #0098A6; text-decoration: none;">support@mediflow.ai</a>
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                            MediFlow AI Healthcare Center &bull; Automated Clinical Notification System &bull; Please do not reply directly to this email.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>"""


@shared_task
def send_appointment_booked_notification(appointment_id):
    try:
        appointment = Appointment.objects.select_related(
            'patient__user',
            'doctor__user',
            'doctor__department'
        ).get(pk=appointment_id)
    except Appointment.DoesNotExist:
        return

    patient_user = appointment.patient.user
    patient_profile = appointment.patient
    doctor_profile = appointment.doctor
    doctor_user = getattr(doctor_profile, 'user', None)

    patient_name = patient_user.full_name or patient_user.email
    patient_email = patient_user.email
    patient_phone = getattr(patient_profile, 'phone', '') or 'Not provided'
    patient_gender = getattr(patient_profile, 'gender', '') or 'Not provided'

    doctor_name = doctor_user.full_name if doctor_user else 'Doctor'
    doctor_email = doctor_user.email if doctor_user else ''
    doctor_spec = getattr(doctor_profile, 'specialization', '') or 'General Practice'
    department_name = doctor_profile.department.name if doctor_profile.department else 'General Medicine'

    date_str = str(appointment.appointment_date)
    time_str = str(appointment.appointment_time)[:5] if len(str(appointment.appointment_time)) >= 5 else str(appointment.appointment_time)
    reason = (appointment.reason or '').strip() or 'General Consultation'

    # 1. In-App Notification (Preserve exact string for backward compatibility with tests)
    patient_inapp_msg = f"Your appointment with Dr. {doctor_name} on {date_str} at {time_str} is confirmed."
    Notification.objects.create(
        user=patient_user,
        notification_type='APPOINTMENT_BOOKED',
        message=patient_inapp_msg
    )

    # 2. Detailed Patient Email
    patient_subject = f"Appointment Confirmed: Dr. {doctor_name} on {date_str}"
    patient_text_body = f"""Dear {patient_name},

Your appointment at MediFlow AI Healthcare is confirmed.

==================================================
APPOINTMENT CONFIRMATION DETAILS
==================================================
• Patient Name:     {patient_name}
• Doctor:           Dr. {doctor_name} ({doctor_spec})
• Department:       {department_name}
• Appointment Date: {date_str}
• Appointment Time: {time_str}
• Consultation Fee: Rs. 500.00
• Chief Reason:     {reason}
• Status:           Confirmed
==================================================

INSTRUCTIONS FOR YOUR VISIT:
1. Please arrive at the hospital registration counter 15 minutes before your time ({time_str}).
2. Please bring a valid government photo ID and any prior prescriptions/lab reports.
3. Manage or view your appointment at: {PORTAL_URL}/patient/appointments

24x7 Emergency Helpline: 102 | Support: support@mediflow.ai
MediFlow AI Healthcare Center
"""
    patient_html = _render_email_html(
        title="Appointment Confirmed",
        subtitle=f"Hello <strong>{patient_name}</strong>, your consultation at MediFlow AI has been successfully booked.",
        badge_text="CONFIRMED",
        badge_color="#10b981",
        rows=[
            ("Doctor", f"Dr. {doctor_name} ({doctor_spec})"),
            ("Department", department_name),
            ("Date", date_str),
            ("Time Slot", time_str),
            ("Reason / Purpose", reason),
            ("Consultation Fee", "Rs. 500.00"),
            ("Status", "<span style='color: #059669; font-weight: 700;'>Confirmed</span>"),
        ],
        footer_note="<strong>Tip:</strong> Please arrive 10-15 minutes prior to your slot. Bring past medical records or prescriptions for a faster consultation.",
        action_url=f"{PORTAL_URL}/patient/appointments",
        action_text="View in Patient Portal"
    )

    send_mail(
        subject=patient_subject,
        message=patient_text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient_email],
        fail_silently=True,
        html_message=patient_html
    )

    # 3. Doctor In-App Notification & Detailed Email
    if doctor_user:
        doc_inapp_msg = f"New appointment booked: Patient {patient_name} on {date_str} at {time_str}."
        Notification.objects.create(
            user=doctor_user,
            notification_type='APPOINTMENT_BOOKED',
            message=doc_inapp_msg
        )

        doc_subject = f"New Appointment Booked: Patient {patient_name} on {date_str} at {time_str}"
        doc_text_body = f"""Dear Dr. {doctor_name},

A new patient appointment has been scheduled under your department.

==================================================
NEW APPOINTMENT DETAILS
==================================================
• Patient Name:     {patient_name}
• Patient Contact:  {patient_phone}
• Patient Email:    {patient_email}
• Gender:           {patient_gender}
• Appointment Date: {date_str}
• Time Slot:        {time_str}
• Department:       {department_name}
• Reason / Note:    {reason}
• Status:           Confirmed (Scheduled)
==================================================

You can review patient history and enter clinical notes directly from your Doctor Portal:
{PORTAL_URL}/doctor/appointments

MediFlow AI Clinical Suite
"""
        doc_html = _render_email_html(
            title="New Patient Appointment Scheduled",
            subtitle=f"Dear <strong>Dr. {doctor_name}</strong>, a new consultation has been booked on your calendar.",
            badge_text="NEW BOOKING",
            badge_color="#0284c7",
            rows=[
                ("Patient Name", patient_name),
                ("Patient Phone", patient_phone),
                ("Patient Email", patient_email),
                ("Gender", patient_gender),
                ("Date", date_str),
                ("Time Slot", time_str),
                ("Department", department_name),
                ("Chief Complaint", reason),
                ("Status", "<span style='color: #0284c7; font-weight: 700;'>Scheduled</span>"),
            ],
            footer_note="You can access the patient's full medical records, history, and write digital prescriptions in your Doctor Portal.",
            action_url=f"{PORTAL_URL}/doctor/appointments",
            action_text="Open Doctor Portal"
        )

        if doctor_email:
            send_mail(
                subject=doc_subject,
                message=doc_text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[doctor_email],
                fail_silently=True,
                html_message=doc_html
            )


@shared_task
def send_appointment_cancelled_notification(appointment_id):
    try:
        appointment = Appointment.objects.select_related(
            'patient__user',
            'doctor__user',
            'doctor__department'
        ).get(pk=appointment_id)
    except Appointment.DoesNotExist:
        return

    patient_user = appointment.patient.user
    doctor_user = getattr(appointment.doctor, 'user', None)

    patient_name = patient_user.full_name or patient_user.email
    doctor_name = doctor_user.full_name if doctor_user else 'Doctor'
    department_name = appointment.doctor.department.name if appointment.doctor.department else 'General'

    date_str = str(appointment.appointment_date)
    time_str = str(appointment.appointment_time)[:5] if len(str(appointment.appointment_time)) >= 5 else str(appointment.appointment_time)

    # In-app message
    message = f"Your appointment with Dr. {doctor_name} on {date_str} at {time_str} has been cancelled."

    Notification.objects.create(
        user=patient_user,
        notification_type='APPOINTMENT_CANCELLED',
        message=message
    )

    patient_subject = "Appointment Cancellation"
    patient_text_body = f"""Dear {patient_name},

Your appointment with Dr. {doctor_name} scheduled for {date_str} at {time_str} has been cancelled.

If you need to book a fresh consultation, please visit:
{PORTAL_URL}/patient/appointments

Hospital Helpline: 102 | MediFlow AI Healthcare
"""
    patient_html = _render_email_html(
        title="Appointment Cancelled",
        subtitle=f"Hello <strong>{patient_name}</strong>, your scheduled appointment has been cancelled.",
        badge_text="CANCELLED",
        badge_color="#ef4444",
        rows=[
            ("Doctor", f"Dr. {doctor_name}"),
            ("Department", department_name),
            ("Date", date_str),
            ("Time Slot", time_str),
            ("Status", "<span style='color: #dc2626; font-weight: 700;'>Cancelled</span>"),
        ],
        footer_note="If this was accidental or you would like to reschedule with another slot, you can easily book through your patient portal.",
        action_url=f"{PORTAL_URL}/patient/appointments",
        action_text="Book New Appointment"
    )

    send_mail(
        subject=patient_subject,
        message=patient_text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient_user.email],
        fail_silently=True,
        html_message=patient_html
    )

    # Notify doctor
    if doctor_user:
        doc_message = f"Appointment cancelled: Patient {patient_name} for {date_str} at {time_str}."
        Notification.objects.create(
            user=doctor_user,
            notification_type='APPOINTMENT_CANCELLED',
            message=doc_message
        )
        doc_html = _render_email_html(
            title="Appointment Cancelled by Patient",
            subtitle=f"Dear <strong>Dr. {doctor_name}</strong>, the consultation slot below has been cancelled.",
            badge_text="CANCELLED",
            badge_color="#ef4444",
            rows=[
                ("Patient Name", patient_name),
                ("Date", date_str),
                ("Time Slot", time_str),
                ("Status", "<span style='color: #dc2626; font-weight: 700;'>Cancelled</span>"),
            ],
            footer_note="This time slot has been freed up on your schedule for other patients.",
            action_url=f"{PORTAL_URL}/doctor/appointments",
            action_text="View Schedule"
        )
        send_mail(
            subject="Appointment Cancellation",
            message=doc_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[doctor_user.email],
            fail_silently=True,
            html_message=doc_html
        )


@shared_task
def send_invoice_generated_notification(invoice_id):
    try:
        invoice = Invoice.objects.select_related('patient__user', 'appointment').get(pk=invoice_id)
    except Invoice.DoesNotExist:
        return

    patient_user = invoice.patient.user
    patient_name = patient_user.full_name or patient_user.email
    total_amount = sum(item.amount for item in invoice.items.all())
    date_str = str(invoice.appointment.appointment_date)

    message = f"An invoice of Rs. {total_amount:.2f} has been generated for your visit on {date_str}."

    Notification.objects.create(
        user=patient_user,
        notification_type='INVOICE_GENERATED',
        message=message
    )

    invoice_html = _render_email_html(
        title="Medical Invoice Generated",
        subtitle=f"Hello <strong>{patient_name}</strong>, your invoice for the hospital consultation has been generated.",
        badge_text="INVOICE",
        badge_color="#0284c7",
        rows=[
            ("Invoice ID", f"INV-{invoice.id:05d}"),
            ("Visit Date", date_str),
            ("Total Amount Due", f"Rs. {total_amount:.2f}"),
            ("Payment Status", "Generated / Pending"),
        ],
        footer_note="You can view, print, or pay your hospital bills online anytime through the billing section of your portal.",
        action_url=f"{PORTAL_URL}/patient/billing",
        action_text="View Invoice & Pay"
    )

    send_mail(
        subject="Invoice Generated",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient_user.email],
        fail_silently=True,
        html_message=invoice_html
    )


@shared_task
def send_appointment_reminders(target_date=None):
    """
    Sends detailed reminder emails to BOTH the patient and the doctor
    for upcoming scheduled appointments. Defaults to tomorrow's appointments.
    """
    if target_date is None:
        target_date = timezone.localtime().date() + timedelta(days=1)

    appointments = Appointment.objects.filter(
        appointment_date=target_date,
        status='SCHEDULED'
    ).select_related('patient__user', 'doctor__user', 'doctor__department')

    reminders_sent = 0
    for appt in appointments:
        patient_user = appt.patient.user
        doctor_user = getattr(appt.doctor, 'user', None)

        patient_name = patient_user.full_name or patient_user.email
        doctor_name = doctor_user.full_name if doctor_user else 'Doctor'
        department_name = appt.doctor.department.name if appt.doctor.department else 'General'

        date_str = str(appt.appointment_date)
        time_str = str(appt.appointment_time)[:5] if len(str(appt.appointment_time)) >= 5 else str(appt.appointment_time)
        reason = (appt.reason or '').strip() or 'General Consultation'

        # 1. Patient In-App Notification (Exact string preserved for test assertions)
        message = f"Reminder: You have an appointment with Dr. {doctor_name} tomorrow at {time_str}."
        Notification.objects.create(
            user=patient_user,
            notification_type='APPOINTMENT_REMINDER',
            message=message
        )

        # 2. Detailed Patient Reminder Email
        patient_subject = "Appointment Reminder"
        patient_text_body = f"""Dear {patient_name},

Reminder: You have an appointment with Dr. {doctor_name} tomorrow at {time_str}.

==================================================
UPCOMING APPOINTMENT DETAILS
==================================================
• Patient:        {patient_name}
• Doctor:         Dr. {doctor_name} ({appt.doctor.specialization})
• Department:     {department_name}
• Date:           {date_str} (Tomorrow)
• Time:           {time_str}
• Reason:         {reason}
• Location:       MediFlow AI Healthcare Center, Main OPD
==================================================

IMPORTANT REMINDERS:
• Please reach the hospital 10-15 minutes prior to your slot time.
• Carry any past prescriptions, diagnostic reports, and personal ID.
• Reschedule or cancel if necessary: {PORTAL_URL}/patient/appointments

Emergency Helpline: 102 | Support: support@mediflow.ai
MediFlow AI Healthcare
"""
        patient_html = _render_email_html(
            title="Appointment Reminder",
            subtitle=f"Hello <strong>{patient_name}</strong>, a friendly reminder that you have an appointment scheduled for tomorrow.",
            badge_text="REMINDER",
            badge_color="#f59e0b",
            rows=[
                ("Doctor", f"Dr. {doctor_name} ({appt.doctor.specialization})"),
                ("Department", department_name),
                ("Date", f"{date_str} (Tomorrow)"),
                ("Time Slot", time_str),
                ("Reason", reason),
                ("Status", "<span style='color: #059669; font-weight: 700;'>Confirmed</span>"),
            ],
            footer_note="<strong>Checklist:</strong> Please arrive 15 minutes before your time. Don't forget your previous medical records.",
            action_url=f"{PORTAL_URL}/patient/appointments",
            action_text="View in Portal"
        )

        send_mail(
            subject=patient_subject,
            message=patient_text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_user.email],
            fail_silently=True,
            html_message=patient_html
        )

        # 3. Detailed Doctor Reminder Email
        if doctor_user and doctor_user.email:
            doc_subject = f"Daily Schedule Reminder: Appointment with {patient_name} tomorrow at {time_str}"
            doc_text_body = f"""Dear Dr. {doctor_name},

This is a schedule reminder for your consultation tomorrow.

==================================================
TOMORROW'S APPOINTMENT
==================================================
• Patient Name:   {patient_name}
• Contact:        {appt.patient.phone or patient_user.email}
• Date:           {date_str} (Tomorrow)
• Time Slot:      {time_str}
• Department:     {department_name}
• Chief Reason:   {reason}
• Status:         Confirmed (Scheduled)
==================================================

You can review patient chart and prepare from your Doctor Portal:
{PORTAL_URL}/doctor/dashboard

MediFlow AI Clinical Suite
"""
            doc_html = _render_email_html(
                title="Schedule Reminder: Upcoming Consultation",
                subtitle=f"Dear <strong>Dr. {doctor_name}</strong>, you have an appointment scheduled for tomorrow.",
                badge_text="DOCTOR REMINDER",
                badge_color="#f59e0b",
                rows=[
                    ("Patient Name", patient_name),
                    ("Patient Contact", appt.patient.phone or patient_user.email),
                    ("Date", f"{date_str} (Tomorrow)"),
                    ("Time Slot", time_str),
                    ("Chief Complaint", reason),
                    ("Status", "<span style='color: #0284c7; font-weight: 700;'>Scheduled</span>"),
                ],
                footer_note="Access digital consultation and patient history from your Doctor Portal.",
                action_url=f"{PORTAL_URL}/doctor/appointments",
                action_text="Open Doctor Portal"
            )

            send_mail(
                subject=doc_subject,
                message=doc_text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[doctor_user.email],
                fail_silently=True,
                html_message=doc_html
            )

        reminders_sent += 1

    return reminders_sent
