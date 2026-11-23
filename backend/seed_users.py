import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.users.models import User
from apps.doctors.models import DoctorProfile
from apps.patients.models import PatientProfile
from apps.departments.models import Department

def seed():
    print("Seeding demo users...")
    
    # 1. Admin
    admin, _ = User.objects.get_or_create(
        email='admin@mediflow.ai',
        defaults={'full_name': 'Hospital Administrator', 'role': 'admin', 'is_staff': True, 'is_superuser': True}
    )
    admin.set_password('Admin@123')
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    print("✓ Admin: admin@mediflow.ai / Admin@123")

    # 2. Departments
    dept_cardio = Department.objects.filter(name='Cardiology').first()
    dept_gen = Department.objects.filter(name='General Medicine').first()

    # 3. Doctors (Pre-approved)
    doc1, _ = User.objects.get_or_create(
        email='doctor@mediflow.ai',
        defaults={'full_name': 'Dr. Rajesh Sharma', 'role': 'doctor'}
    )
    doc1.set_password('Doctor@123')
    doc1.save()
    DoctorProfile.objects.update_or_create(
        user=doc1,
        defaults={
            'specialization': 'Cardiologist',
            'experience_years': 10,
            'qualification': 'MBBS, MD (Cardiology)',
            'department': dept_cardio,
            'available_time': 'Mon-Sat, 9AM-5PM',
            'is_approved': True
        }
    )
    print("✓ Doctor: doctor@mediflow.ai / Doctor@123")

    doc2, _ = User.objects.get_or_create(
        email='doctor.priya@mediflow.ai',
        defaults={'full_name': 'Dr. Priya Patel', 'role': 'doctor'}
    )
    doc2.set_password('Doctor@123')
    doc2.save()
    DoctorProfile.objects.update_or_create(
        user=doc2,
        defaults={
            'specialization': 'General Physician',
            'experience_years': 7,
            'qualification': 'MBBS',
            'department': dept_gen,
            'available_time': 'Mon-Fri, 10AM-6PM',
            'is_approved': True
        }
    )
    print("✓ Doctor 2: doctor.priya@mediflow.ai / Doctor@123")

    # 4. Patients
    pat1, _ = User.objects.get_or_create(
        email='patient@mediflow.ai',
        defaults={'full_name': 'Rahul Verma', 'role': 'patient'}
    )
    pat1.set_password('Patient@123')
    pat1.save()
    PatientProfile.objects.update_or_create(
        user=pat1,
        defaults={
            'date_of_birth': datetime.date(1995, 5, 15),
            'gender': 'Male',
            'phone': '9876543210'
        }
    )
    print("✓ Patient: patient@mediflow.ai / Patient@123")

    pat2, _ = User.objects.get_or_create(
        email='patient.sneha@mediflow.ai',
        defaults={'full_name': 'Sneha Kapoor', 'role': 'patient'}
    )
    pat2.set_password('Patient@123')
    pat2.save()
    PatientProfile.objects.update_or_create(
        user=pat2,
        defaults={
            'date_of_birth': datetime.date(1998, 8, 22),
            'gender': 'Female',
            'phone': '9876543211'
        }
    )
    print("✓ Patient 2: patient.sneha@mediflow.ai / Patient@123")

    # 5. Knowledge Base Sample FAQ & Policy
    from apps.ai_assistant.models import KnowledgeDocument, DocumentChunk
    kb_doc, created = KnowledgeDocument.objects.get_or_create(
        title='MediFlow Hospital General FAQ & Policy Guide',
        defaults={
            'category': 'FAQ',
            'uploaded_by': admin,
            'is_active': True
        }
    )
    if not kb_doc.chunks.exists():
        faq_chunks = [
            "MediFlow Hospital visiting hours are from 10:00 AM to 1:00 PM in the morning and 5:00 PM to 8:00 PM in the evening every day. ICU visits are restricted to 1 attendant at a time between 4:00 PM and 5:00 PM.",
            "Appointments can be booked online through the patient portal. Consultation fees are Rs. 500.00 per visit. Cancellations must be made before the appointment time.",
            "MediFlow offers emergency services 24 hours a day, 7 days a week, including a 24/7 trauma care unit and rapid response ambulance services. Ambulance helpline: 102.",
            "The Cardiology department is led by Dr. Rajesh Sharma, specializing in heart checkups, ECG, and cardiovascular care. General Medicine handles primary health checkups and routine diagnostics."
        ]
        for i, ct in enumerate(faq_chunks):
            DocumentChunk.objects.create(
                document=kb_doc,
                chunk_index=i,
                chunk_text=ct
            )
        print("✓ Knowledge Base: Sample hospital FAQ & policies indexed")

    print("\nAll accounts are ready to use!")

if __name__ == '__main__':
    seed()
