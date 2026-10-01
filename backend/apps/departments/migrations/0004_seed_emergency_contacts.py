from django.db import migrations


def seed_emergency_contacts(apps, schema_editor):
    # NOTE: Hospital admin should replace placeholder phone numbers
    # (000-000-0000, 000-000-0001) with real numbers via the Django admin panel.
    EmergencyContact = apps.get_model('departments', 'EmergencyContact')
    contacts = [
        {
            'name': 'Hospital Emergency Department',
            'contact_type': 'EMERGENCY_DEPT',
            'phone_number': '000-000-0000',
            'description': 'Available 24/7',
        },
        {
            'name': 'Ambulance Service',
            'contact_type': 'AMBULANCE',
            'phone_number': '000-000-0001',
            'description': 'For emergency transport',
        },
        {
            'name': 'National Emergency Helpline',
            'contact_type': 'HELPLINE',
            'phone_number': '112',
            'description': 'General emergency helpline',
        },
    ]
    for contact in contacts:
        EmergencyContact.objects.get_or_create(
            name=contact['name'],
            defaults={
                'contact_type': contact['contact_type'],
                'phone_number': contact['phone_number'],
                'description': contact['description'],
                'is_active': True,
            },
        )


def remove_emergency_contacts(apps, schema_editor):
    EmergencyContact = apps.get_model('departments', 'EmergencyContact')
    EmergencyContact.objects.filter(
        name__in=[
            'Hospital Emergency Department',
            'Ambulance Service',
            'National Emergency Helpline',
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('departments', '0003_emergencycontact'),
    ]

    operations = [
        migrations.RunPython(seed_emergency_contacts, remove_emergency_contacts),
    ]
