import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.users.models import User
from apps.doctors.models import DoctorProfile
from apps.departments.models import Department

doctors_data = [
    {
        "email": "doctor1@example.com",
        "full_name": "Dr. Rajesh Sharma",
        "specialization": "Cardiologist",
        "qualification": "MBBS, MD (Cardiology), DM",
        "experience_years": 12,
        "department_name": "Cardiology",
        "department_desc": "Cardiovascular and heart care department",
        "available_time": "Mon-Fri, 09:00 - 15:00",
    },
    {
        "email": "doctor2@example.com",
        "full_name": "Dr. Priya Nair",
        "specialization": "Neurologist",
        "qualification": "MBBS, MD, DM (Neurology)",
        "experience_years": 9,
        "department_name": "Neurology",
        "department_desc": "Brain, spine and neurological disorders",
        "available_time": "Mon-Sat, 10:00 - 16:00",
    },
    {
        "email": "doctor3@example.com",
        "full_name": "Dr. Amit Patel",
        "specialization": "Orthopedic Surgeon",
        "qualification": "MBBS, MS (Orthopedics), M.Ch",
        "experience_years": 15,
        "department_name": "Orthopedics",
        "department_desc": "Bone, joint, and musculoskeletal care",
        "available_time": "Tue-Sat, 09:00 - 17:00",
    },
    {
        "email": "doctor4@example.com",
        "full_name": "Dr. Sneha Kulkarni",
        "specialization": "Pediatrician",
        "qualification": "MBBS, MD (Pediatrics), DNB",
        "experience_years": 7,
        "department_name": "Pediatrics",
        "department_desc": "Infant, child, and adolescent healthcare",
        "available_time": "Mon-Fri, 08:30 - 14:30",
    },
    {
        "email": "doctor5@example.com",
        "full_name": "Dr. Vikram Malhotra",
        "specialization": "General Physician",
        "qualification": "MBBS, MD (Internal Medicine)",
        "experience_years": 10,
        "department_name": "General Medicine",
        "department_desc": "Primary care and internal medicine",
        "available_time": "Mon-Sat, 09:00 - 17:00",
    },
    {
        "email": "doctor6@example.com",
        "full_name": "Dr. Ananya Sen",
        "specialization": "Dermatologist",
        "qualification": "MBBS, MD (Dermatology, Venereology & Leprosy)",
        "experience_years": 6,
        "department_name": "Dermatology",
        "department_desc": "Skin, hair, nails and cosmetic dermatology",
        "available_time": "Mon-Thu, 11:00 - 18:00",
    },
]

for doc in doctors_data:
    dept, _ = Department.objects.get_or_create(
        name=doc["department_name"],
        defaults={"description": doc["department_desc"]}
    )
    user, created = User.objects.get_or_create(
        email=doc["email"],
        defaults={
            "full_name": doc["full_name"],
            "role": "doctor",
            "is_active": True,
        }
    )
    user.full_name = doc["full_name"]
    user.role = "doctor"
    user.is_active = True
    user.set_password("password")
    user.save()

    profile, p_created = DoctorProfile.objects.get_or_create(
        user=user,
        defaults={
            "specialization": doc["specialization"],
            "qualification": doc["qualification"],
            "experience_years": doc["experience_years"],
            "department": dept,
            "available_time": doc["available_time"],
            "is_approved": True,
        }
    )
    if not p_created:
        profile.specialization = doc["specialization"]
        profile.qualification = doc["qualification"]
        profile.experience_years = doc["experience_years"]
        profile.department = dept
        profile.available_time = doc["available_time"]
        profile.is_approved = True
        profile.save()

    print(f"Doctor '{doc['full_name']}' ({doc['email']}) -> {doc['specialization']} in {dept.name} [SUCCESS]")
