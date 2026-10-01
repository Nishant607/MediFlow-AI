import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.departments.models import EmergencyContact
from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def patient_user(db):
    user = User.objects.create_user(
        email='patient9@test.com',
        password='testpass123',
        full_name='Test Patient',
        role='patient',
    )
    return user


@pytest.fixture
def auth_client(api_client, patient_user):
    api_client.force_authenticate(user=patient_user)
    return api_client


@pytest.fixture
def emergency_contacts(db):
    active1 = EmergencyContact.objects.create(
        name='Hospital Emergency Department',
        contact_type='EMERGENCY_DEPT',
        phone_number='000-000-0000',
        description='Available 24/7',
        is_active=True,
    )
    active2 = EmergencyContact.objects.create(
        name='Ambulance Service',
        contact_type='AMBULANCE',
        phone_number='000-000-0001',
        description='For emergency transport',
        is_active=True,
    )
    inactive = EmergencyContact.objects.create(
        name='Old Helpline',
        contact_type='HELPLINE',
        phone_number='999',
        description='Decommissioned',
        is_active=False,
    )
    return active1, active2, inactive


@pytest.mark.django_db
def test_emergency_contacts_list_returns_only_active_ones(auth_client, emergency_contacts):
    url = reverse('emergency-contact-list')
    response = auth_client.get(url)
    assert response.status_code == 200
    data = response.json()
    names = [item['name'] for item in data]
    assert 'Hospital Emergency Department' in names
    assert 'Ambulance Service' in names
    assert 'Old Helpline' not in names


@pytest.mark.django_db
def test_emergency_contacts_requires_authentication(api_client, emergency_contacts):
    url = reverse('emergency-contact-list')
    response = api_client.get(url)
    assert response.status_code == 401
