import pytest
from apps.users.models import User
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department


@pytest.mark.django_db
def test_doctor_profile_str_representation():
    dept, _ = Department.objects.get_or_create(name='Cardiology')
    user = User.objects.create_user(
        email='doctor_str@example.com',
        password='password123',
        full_name='Dr. Strange',
        role='doctor'
    )
    profile = DoctorProfile.objects.create(
        user=user,
        specialization='Neurology',
        experience_years=10,
        qualification='MD',
        department=dept,
        is_approved=False
    )
    assert 'Pending Approval' in str(profile)
    profile.is_approved = True
    profile.save()
    assert 'Approved' in str(profile)
