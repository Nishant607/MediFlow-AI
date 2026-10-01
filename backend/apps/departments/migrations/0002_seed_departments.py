from django.db import migrations


def seed_departments(apps, schema_editor):
    Department = apps.get_model('departments', 'Department')
    departments = [
        {'name': 'Cardiology', 'description': 'Heart and cardiovascular system care and treatments.'},
        {'name': 'Neurology', 'description': 'Brain, spinal cord, and nervous system disorders.'},
        {'name': 'Orthopedics', 'description': 'Musculoskeletal system, bones, joints, and ligaments.'},
        {'name': 'General Medicine', 'description': 'Comprehensive primary healthcare and routine medical diagnostics.'},
    ]
    for dept_data in departments:
        Department.objects.get_or_create(name=dept_data['name'], defaults={'description': dept_data['description']})


def remove_departments(apps, schema_editor):
    Department = apps.get_model('departments', 'Department')
    Department.objects.filter(name__in=['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('departments', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_departments, remove_departments),
    ]
