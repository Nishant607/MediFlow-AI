from datetime import datetime, timedelta, time
from django.utils import timezone
from apps.appointments.constants import (
    CLINIC_START_TIME,
    CLINIC_END_TIME,
    SLOT_DURATION_MINUTES,
    CLINIC_CLOSED_WEEKDAY
)
from apps.appointments.models import Appointment


def generate_clinic_slots():
    """Generates all 30-minute time slots between 09:00 and 17:00."""
    slots = []
    current_dt = datetime.combine(datetime.today(), CLINIC_START_TIME)
    end_dt = datetime.combine(datetime.today(), CLINIC_END_TIME)
    
    while current_dt < end_dt:
        slots.append(current_dt.time())
        current_dt += timedelta(minutes=SLOT_DURATION_MINUTES)
    return slots


def get_available_slots(doctor, target_date):
    """
    Returns available time slots for a given doctor and date.
    Returns dict:
    {
        "is_closed": bool,
        "message": str,
        "available_slots": [{"time": "09:00", "available": bool}, ...]
    }
    """
    if isinstance(target_date, str):
        try:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
        except ValueError:
            return {"is_closed": False, "message": "Invalid date format. Use YYYY-MM-DD.", "available_slots": []}

    today = timezone.localtime().date()
    now_time = timezone.localtime().time()

    if target_date.weekday() == CLINIC_CLOSED_WEEKDAY:
        return {"is_closed": True, "message": "Clinic is closed on Sundays.", "available_slots": []}

    if not doctor.is_approved:
        return {"is_closed": True, "message": "Doctor is pending admin approval.", "available_slots": []}

    all_slots = generate_clinic_slots()

    # Query booked slots for this doctor on target_date
    booked_times = set(
        Appointment.objects.filter(
            doctor=doctor,
            appointment_date=target_date,
            status='SCHEDULED'
        ).values_list('appointment_time', flat=True)
    )

    available_slots = []
    for slot_time in all_slots:
        is_booked = slot_time in booked_times
        is_past = (target_date < today) or (target_date == today and slot_time <= now_time)
        available = not (is_booked or is_past)
        available_slots.append({
            "time": slot_time.strftime('%H:%M'),
            "available": available
        })

    return {
        "is_closed": False,
        "message": "",
        "available_slots": available_slots
    }


def is_slot_bookable(doctor, target_date, target_time):
    """
    Validates if a specific doctor, date, and time slot is bookable.
    Returns tuple: (is_valid: bool, error_reason: str or None)
    """
    if isinstance(target_date, str):
        try:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
        except ValueError:
            return False, 'Invalid date format. Use YYYY-MM-DD.'

    if isinstance(target_time, str):
        try:
            # Parse '09:00' or '09:00:00'
            time_parts = [int(p) for p in target_time.split(':')]
            target_time = time(time_parts[0], time_parts[1])
        except (ValueError, IndexError):
            return False, 'Invalid time format. Use HH:MM.'

    today = timezone.localtime().date()
    now_time = timezone.localtime().time()

    if target_date < today:
        return False, 'Cannot book appointments for past dates.'

    if target_date.weekday() == CLINIC_CLOSED_WEEKDAY:
        return False, 'Clinic is closed on Sundays.'

    if not doctor.is_approved:
        return False, 'Doctor is not approved for appointments.'

    all_slots = generate_clinic_slots()
    if target_time not in all_slots:
        return False, 'Selected time is outside operating clinic hours (09:00 AM - 05:00 PM).'

    if target_date == today and target_time <= now_time:
        return False, 'Cannot book a time slot in the past.'

    is_already_booked = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=target_date,
        appointment_time=target_time,
        status='SCHEDULED'
    ).exists()

    if is_already_booked:
        return False, 'This time slot is already booked.'

    return True, None
