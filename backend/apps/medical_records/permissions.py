from apps.appointments.models import Appointment


def user_can_access_patient_records(user, patient_profile) -> bool:
    """
    Returns True if:
      - user.role == 'patient' and user.patient_profile == patient_profile, OR
      - user.role == 'doctor' and Appointment.objects.filter(doctor=user.doctor_profile, patient=patient_profile).exists(), OR
      - user.role == 'admin' or user.is_staff
    Returns False otherwise.
    """
    if not user or not user.is_authenticated:
        return False

    if user.role == 'admin' or user.is_staff:
        return True

    if user.role == 'patient' and hasattr(user, 'patient_profile') and user.patient_profile == patient_profile:
        return True

    if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
        return Appointment.objects.filter(
            doctor=user.doctor_profile,
            patient=patient_profile
        ).exists()

    return False
