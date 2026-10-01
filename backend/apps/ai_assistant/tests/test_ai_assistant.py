from unittest.mock import patch
import pytest
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.appointments.models import Appointment
from apps.audit.models import AuditLog
from apps.medical_records.models import MedicalReport, Prescription
from apps.ai_assistant.models import (
    KnowledgeDocument,
    DocumentChunk,
    Message,
    ReportSummary
)
from apps.ai_assistant.services.guardrails import EMERGENCY_RESPONSE
from apps.ai_assistant.services.retrieval import get_relevant_chunks


@pytest.mark.django_db
class TestAIAssistant:

    @pytest.fixture(autouse=True)
    def clear_cache_and_throttles(self):
        cache.clear()

    @pytest.fixture
    def admin_user(self):
        return User.objects.create_user(
            email='admin@hospital.com',
            password='password123',
            role='admin'
        )

    @pytest.fixture
    def patient_user_1(self):
        user = User.objects.create_user(
            email='patient1@hospital.com',
            password='password123',
            role='patient',
            full_name='Patient One'
        )
        PatientProfile.objects.create(
            user=user,
            date_of_birth='1990-01-01',
            phone='1234567890'
        )
        return user

    @pytest.fixture
    def patient_user_2(self):
        user = User.objects.create_user(
            email='patient2@hospital.com',
            password='password123',
            role='patient',
            full_name='Patient Two'
        )
        PatientProfile.objects.create(
            user=user,
            date_of_birth='1992-02-02',
            phone='0987654321'
        )
        return user

    @pytest.fixture
    def admin_client(self, admin_user):
        client = APIClient()
        client.force_authenticate(user=admin_user)
        return client

    @pytest.fixture
    def patient_client_1(self, patient_user_1):
        client = APIClient()
        client.force_authenticate(user=patient_user_1)
        return client

    @pytest.fixture
    def patient_client_2(self, patient_user_2):
        client = APIClient()
        client.force_authenticate(user=patient_user_2)
        return client

    @pytest.fixture
    def doctor_user(self):
        user = User.objects.create_user(
            email='doctor@hospital.com',
            password='password123',
            role='doctor',
            full_name='Dr. Smith'
        )
        DoctorProfile.objects.create(
            user=user,
            specialization='Cardiology',
            experience_years=10,
            qualification='MD',
            is_approved=True
        )
        return user

    @pytest.fixture
    def doctor_client(self, doctor_user):
        client = APIClient()
        client.force_authenticate(user=doctor_user)
        return client

    # 1. Admin TXT Upload
    def test_admin_can_upload_txt_document_and_chunks_are_created(self, admin_client):
        content = ("Hospital visiting hours are from 9:00 AM to 5:00 PM daily. "
                   "All visitors must sign in at the front desk and wear a visitor pass.")
        txt_file = SimpleUploadedFile(
            "visiting_policy.txt",
            content.encode("utf-8"),
            content_type="text/plain"
        )
        response = admin_client.post(
            "/api/ai-assistant/documents/",
            {
                "title": "Visiting Policy",
                "category": "APPOINTMENT_POLICY",
                "file": txt_file
            },
            format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert KnowledgeDocument.objects.count() == 1
        doc = KnowledgeDocument.objects.first()
        assert doc.title == "Visiting Policy"
        assert doc.chunks.count() > 0

    # 2. Admin PDF Upload
    @patch("apps.ai_assistant.views.extract_text")
    def test_admin_can_upload_pdf_document_and_chunks_are_created(self, mock_extract, admin_client):
        mock_extract.return_value = "Emergency guidelines for hospital staff and patients."
        pdf_file = SimpleUploadedFile(
            "emergency.pdf",
            b"%PDF-1.4 dummy pdf content",
            content_type="application/pdf"
        )
        response = admin_client.post(
            "/api/ai-assistant/documents/",
            {
                "title": "Emergency Guidelines",
                "category": "EMERGENCY_GUIDELINES",
                "file": pdf_file
            },
            format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert KnowledgeDocument.objects.count() == 1
        doc = KnowledgeDocument.objects.first()
        assert doc.chunks.count() > 0

    # 3. Reject Invalid File Extension
    def test_document_upload_rejects_invalid_file_extension(self, admin_client):
        invalid_file = SimpleUploadedFile(
            "document.docx",
            b"invalid format",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        response = admin_client.post(
            "/api/ai-assistant/documents/",
            {
                "title": "Invalid File",
                "category": "OTHER",
                "file": invalid_file
            },
            format="multipart"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # 4. Reject Oversized File
    def test_document_upload_rejects_oversized_file(self, admin_client):
        large_content = b"a" * (6 * 1024 * 1024)  # 6MB
        large_file = SimpleUploadedFile(
            "large.txt",
            large_content,
            content_type="text/plain"
        )
        response = admin_client.post(
            "/api/ai-assistant/documents/",
            {
                "title": "Large File",
                "category": "OTHER",
                "file": large_file
            },
            format="multipart"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # 5. Non-Admin Cannot Upload
    def test_non_admin_cannot_upload_document(self, patient_client_1):
        txt_file = SimpleUploadedFile(
            "test.txt",
            b"test content",
            content_type="text/plain"
        )
        response = patient_client_1.post(
            "/api/ai-assistant/documents/",
            {
                "title": "Unauthorized Upload",
                "category": "FAQ",
                "file": txt_file
            },
            format="multipart"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # 6. Admin List Documents with Chunk Count
    def test_admin_can_list_documents_with_chunk_count(self, admin_client, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Insurance FAQ",
            category="INSURANCE_POLICY",
            file="knowledge_base/test.txt",
            uploaded_by=admin_user
        )
        DocumentChunk.objects.create(document=doc, chunk_text="Chunk 1", chunk_index=0)
        DocumentChunk.objects.create(document=doc, chunk_text="Chunk 2", chunk_index=1)

        response = admin_client.get("/api/ai-assistant/documents/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["chunk_count"] == 2

    # 7. Toggle Document Active
    def test_admin_can_toggle_document_active(self, admin_client, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Toggle Doc",
            category="FAQ",
            file="knowledge_base/toggle.txt",
            uploaded_by=admin_user,
            is_active=True
        )
        response = admin_client.patch(f"/api/ai-assistant/documents/{doc.id}/toggle-active/")
        assert response.status_code == status.HTTP_200_OK
        doc.refresh_from_db()
        assert doc.is_active is False

    # 8. Delete Document and Chunks
    def test_admin_can_delete_document_and_its_chunks(self, admin_client, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Delete Doc",
            category="FAQ",
            file="knowledge_base/delete.txt",
            uploaded_by=admin_user
        )
        DocumentChunk.objects.create(document=doc, chunk_text="Chunk text", chunk_index=0)

        response = admin_client.delete(f"/api/ai-assistant/documents/{doc.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert KnowledgeDocument.objects.count() == 0
        assert DocumentChunk.objects.count() == 0

    # 9. Retrieval Returns Relevant Chunk
    def test_retrieval_returns_relevant_chunk_for_matching_query(self, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Visiting Policy",
            category="APPOINTMENT_POLICY",
            file="test.txt",
            uploaded_by=admin_user,
            is_active=True
        )
        DocumentChunk.objects.create(
            document=doc,
            chunk_text="Hospital visiting hours are strictly 9 AM to 5 PM every day.",
            chunk_index=0
        )
        chunks = get_relevant_chunks("What are the visiting hours?")
        assert len(chunks) > 0
        assert "visiting hours" in chunks[0]

    def test_retrieval_matches_paraphrased_query_with_different_wording(self, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Cardiology Department Info",
            category="DEPARTMENT_INFO",
            file="cardiology.txt",
            uploaded_by=admin_user,
            is_active=True
        )
        DocumentChunk.objects.create(
            document=doc,
            chunk_text="Cardiology hours: 9am to 5pm, Monday through Saturday.",
            chunk_index=0
        )
        chunks = get_relevant_chunks("what are the cardiology department timings?")
        assert len(chunks) > 0
        assert "Cardiology hours" in chunks[0]

    # 10. Retrieval Returns Empty for Unrelated Query
    def test_retrieval_returns_empty_for_query_with_no_relevant_documents(self, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Billing Info",
            category="OTHER",
            file="billing.txt",
            uploaded_by=admin_user,
            is_active=True
        )
        DocumentChunk.objects.create(
            document=doc,
            chunk_text="Invoices must be paid within 30 days of appointment.",
            chunk_index=0
        )
        chunks = get_relevant_chunks("quantum physics propulsion engine")
        assert len(chunks) == 0

    # 11. Retrieval Ignores Inactive Documents
    def test_retrieval_ignores_inactive_documents(self, admin_user):
        doc = KnowledgeDocument.objects.create(
            title="Inactive Doc",
            category="FAQ",
            file="test.txt",
            uploaded_by=admin_user,
            is_active=False
        )
        DocumentChunk.objects.create(
            document=doc,
            chunk_text="Hospital visiting hours are 9 AM to 5 PM.",
            chunk_index=0
        )
        chunks = get_relevant_chunks("visiting hours")
        assert len(chunks) == 0

    # 12. Chat Grounded Answer
    @patch("apps.ai_assistant.views.get_llm_response")
    def test_chat_returns_grounded_answer_when_relevant_context_found(self, mock_llm, patient_client_1, admin_user):
        mock_llm.return_value = "Visiting hours are 9 AM to 5 PM."
        doc = KnowledgeDocument.objects.create(
            title="Visiting Policy",
            category="FAQ",
            file="test.txt",
            uploaded_by=admin_user,
            is_active=True
        )
        DocumentChunk.objects.create(
            document=doc,
            chunk_text="Visiting hours are 9 AM to 5 PM daily.",
            chunk_index=0
        )
        response = patient_client_1.post("/api/ai-assistant/chat/", {"message": "What are visiting hours?"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["grounded"] is True
        assert data["reply"] == "Visiting hours are 9 AM to 5 PM."
        assert mock_llm.called

    # 13. Chat Fallback Without Calling LLM
    @patch("apps.ai_assistant.views.get_llm_response")
    def test_chat_returns_fallback_message_without_calling_llm_when_no_context_found(self, mock_llm, patient_client_1):
        response = patient_client_1.post("/api/ai-assistant/chat/", {"message": "Tell me about spaceship propulsion"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["grounded"] is False
        assert "I don't have specific information" in data["reply"]
        assert not mock_llm.called

    # 14. Chat Emergency Check Skips LLM
    @patch("apps.ai_assistant.views.get_llm_response")
    def test_chat_triggers_emergency_response_and_skips_llm_for_severe_symptoms(self, mock_llm, patient_client_1):
        response = patient_client_1.post("/api/ai-assistant/chat/", {"message": "I have severe chest pain"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["grounded"] is False
        assert data["reply"] == EMERGENCY_RESPONSE
        assert not mock_llm.called

    # 15. Chat Rejects Message Over Max Length
    def test_chat_rejects_message_over_max_length(self, patient_client_1):
        long_message = "a" * 1001
        response = patient_client_1.post("/api/ai-assistant/chat/", {"message": long_message})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # 16. Chat Saves Both User and Assistant Messages
    @patch("apps.ai_assistant.views.get_llm_response")
    def test_chat_saves_both_user_and_assistant_messages(self, mock_llm, patient_client_1, patient_user_1, admin_user):
        mock_llm.return_value = "Here is the information."
        doc = KnowledgeDocument.objects.create(
            title="Info",
            category="FAQ",
            file="info.txt",
            uploaded_by=admin_user,
            is_active=True
        )
        DocumentChunk.objects.create(document=doc, chunk_text="General info about hospital.", chunk_index=0)

        patient_client_1.post("/api/ai-assistant/chat/", {"message": "Give me hospital info"})
        messages = Message.objects.filter(patient=patient_user_1.patient_profile).order_by("created_at")
        assert messages.count() == 2
        assert messages[0].role == "user"
        assert messages[1].role == "assistant"

    # 17. Patient Retrieve Own Message History
    def test_patient_can_retrieve_own_message_history(self, patient_client_1, patient_user_1):
        p_profile = patient_user_1.patient_profile
        Message.objects.create(patient=p_profile, role="user", content="Hello AI")
        Message.objects.create(patient=p_profile, role="assistant", content="Hello Patient")

        response = patient_client_1.get("/api/ai-assistant/messages/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2

    # 18. Patient Cannot See Another Patient's History
    def test_patient_cannot_see_another_patients_message_history(self, patient_client_2, patient_user_1):
        p1_profile = patient_user_1.patient_profile
        Message.objects.create(patient=p1_profile, role="user", content="Patient 1 secret question")

        response = patient_client_2.get("/api/ai-assistant/messages/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    # 19. Chat Rate Limiting (15/min)
    @patch("apps.ai_assistant.views.get_llm_response")
    def test_chat_rate_limiting_blocks_excessive_requests(self, mock_llm, patient_client_1):
        for _ in range(15):
            patient_client_1.post("/api/ai-assistant/chat/", {"message": "Hello"})

        response = patient_client_1.post("/api/ai-assistant/chat/", {"message": "Over limit request"})
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    # 20. Audit Log Created for Upload and Deletion
    def test_audit_log_created_for_document_upload_and_deletion(self, admin_client):
        txt_file = SimpleUploadedFile("test.txt", b"sample content", content_type="text/plain")
        res_upload = admin_client.post(
            "/api/ai-assistant/documents/",
            {
                "title": "Audit Test Doc",
                "category": "FAQ",
                "file": txt_file
            },
            format="multipart"
        )
        assert res_upload.status_code == status.HTTP_201_CREATED
        doc_id = res_upload.json()["document"]["id"]
        assert AuditLog.objects.filter(action="KB_DOCUMENT_UPLOADED").count() == 1

        res_delete = admin_client.delete(f"/api/ai-assistant/documents/{doc_id}/")
        assert res_delete.status_code == status.HTTP_200_OK
        assert AuditLog.objects.filter(action="KB_DOCUMENT_DELETED").count() == 1

    # 21. Report summary generated and cached on second call
    @patch("apps.ai_assistant.services.report_summarizer.get_llm_response")
    def test_report_summary_generated_and_cached_on_second_call(
        self, mock_llm, patient_client_1, patient_user_1
    ):
        mock_llm.return_value = "Normal white blood cell count."
        report_file = SimpleUploadedFile(
            "lab.txt",
            b"White blood cell count: 6.5 (Normal)",
            content_type="text/plain"
        )
        report = MedicalReport.objects.create(
            patient=patient_user_1.patient_profile,
            title="CBC Report",
            file=report_file
        )

        res1 = patient_client_1.post(f"/api/ai-assistant/reports/{report.id}/summarize/")
        assert res1.status_code == status.HTTP_200_OK
        assert res1.json()["summary"] == "Normal white blood cell count."
        assert mock_llm.call_count == 1
        assert ReportSummary.objects.filter(report=report).count() == 1

        res2 = patient_client_1.post(f"/api/ai-assistant/reports/{report.id}/summarize/")
        assert res2.status_code == status.HTTP_200_OK
        assert res2.json()["summary"] == "Normal white blood cell count."
        # Second call must NOT call LLM again (cached)
        assert mock_llm.call_count == 1

    # 22. Report summary denied for report belonging to another patient
    def test_report_summary_denied_for_report_belonging_to_another_patient(
        self, patient_client_2, patient_user_1
    ):
        report_file = SimpleUploadedFile(
            "lab.txt",
            b"Secret data",
            content_type="text/plain"
        )
        report = MedicalReport.objects.create(
            patient=patient_user_1.patient_profile,
            title="Private Report",
            file=report_file
        )

        response = patient_client_2.post(f"/api/ai-assistant/reports/{report.id}/summarize/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    # 23. Handles unextractable file without calling LLM
    @patch("apps.ai_assistant.services.report_summarizer.get_llm_response")
    def test_report_summary_handles_unextractable_file_without_calling_llm(
        self, mock_llm, patient_client_1, patient_user_1
    ):
        img_file = SimpleUploadedFile(
            "scan.png",
            b"\x89PNG\r\n\x1a\nfakeimagebytes",
            content_type="image/png"
        )
        report = MedicalReport.objects.create(
            patient=patient_user_1.patient_profile,
            title="Chest X-Ray",
            file=img_file
        )

        response = patient_client_1.post(f"/api/ai-assistant/reports/{report.id}/summarize/")
        assert response.status_code == status.HTTP_200_OK
        assert "can't be automatically summarized yet" in response.json()["summary"]
        assert not mock_llm.called

    # 24. Truncates very long text before calling LLM
    @patch("apps.ai_assistant.services.report_summarizer.get_llm_response")
    def test_report_summary_truncates_very_long_text_before_calling_llm(
        self, mock_llm, patient_client_1, patient_user_1
    ):
        mock_llm.return_value = "Summary of long report."
        long_content = "Word " * 2000  # 10,000 characters
        long_file = SimpleUploadedFile(
            "large_report.txt",
            long_content.encode("utf-8"),
            content_type="text/plain"
        )
        report = MedicalReport.objects.create(
            patient=patient_user_1.patient_profile,
            title="Very Long Report",
            file=long_file
        )

        response = patient_client_1.post(f"/api/ai-assistant/reports/{report.id}/summarize/")
        assert response.status_code == status.HTTP_200_OK
        assert mock_llm.called
        passed_chunks = mock_llm.call_args[0][0]
        assert len(passed_chunks[0]) == 6000

    # 25. Doctor can generate patient summary with shared appointment history
    @patch("apps.ai_assistant.services.patient_summarizer.get_llm_response")
    def test_doctor_can_generate_patient_summary_with_shared_appointment_history(
        self, mock_llm, doctor_client, doctor_user, patient_user_1
    ):
        mock_llm.return_value = "Patient has history of mild hypertension."
        patient_profile = patient_user_1.patient_profile
        doctor_profile = doctor_user.doctor_profile

        # Shared appointment
        apt = Appointment.objects.create(
            doctor=doctor_profile,
            patient=patient_profile,
            appointment_date='2026-08-15',
            appointment_time='10:00:00',
            status='COMPLETED'
        )
        Prescription.objects.create(
            appointment=apt,
            doctor=doctor_profile,
            patient=patient_profile,
            symptoms="Mild chest discomfort",
            observations="BP 130/85",
            prescription_text="Amlodipine 5mg once daily"
        )

        response = doctor_client.post(f"/api/ai-assistant/patients/{patient_profile.id}/summary/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["summary"] == "Patient has history of mild hypertension."
        assert mock_llm.called
        history_arg = mock_llm.call_args[0][0][0]
        assert "Visit on 2026-08-15" in history_arg
        assert "Mild chest discomfort" in history_arg
        assert "Amlodipine 5mg" in history_arg

    # 26. Doctor cannot generate summary for unrelated patient
    def test_doctor_cannot_generate_summary_for_unrelated_patient(
        self, doctor_client, patient_user_2
    ):
        patient_profile = patient_user_2.patient_profile
        response = doctor_client.post(f"/api/ai-assistant/patients/{patient_profile.id}/summary/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # 27. Returns no history message without calling LLM when patient has no prescriptions
    @patch("apps.ai_assistant.services.patient_summarizer.get_llm_response")
    def test_patient_summary_returns_no_history_message_without_calling_llm_when_patient_has_no_prescriptions(
        self, mock_llm, doctor_client, doctor_user, patient_user_1
    ):
        patient_profile = patient_user_1.patient_profile
        doctor_profile = doctor_user.doctor_profile

        # Shared appointment exists, but no prescriptions created yet
        Appointment.objects.create(
            doctor=doctor_profile,
            patient=patient_profile,
            appointment_date='2026-08-20',
            appointment_time='11:00:00',
            status='SCHEDULED'
        )

        response = doctor_client.post(f"/api/ai-assistant/patients/{patient_profile.id}/summary/")
        assert response.status_code == status.HTTP_200_OK
        assert "No consultation history available yet for this patient." in response.json()["summary"]
        assert not mock_llm.called

    # 28. Patient summary only uses most recent 10 prescriptions
    @patch("apps.ai_assistant.services.patient_summarizer.get_llm_response")
    def test_patient_summary_only_uses_most_recent_10_prescriptions(
        self, mock_llm, doctor_client, doctor_user, patient_user_1
    ):
        mock_llm.return_value = "Summary of recent 10 prescriptions."
        patient_profile = patient_user_1.patient_profile
        doctor_profile = doctor_user.doctor_profile

        # Create 12 appointments and prescriptions on different dates
        for i in range(1, 13):
            apt = Appointment.objects.create(
                doctor=doctor_profile,
                patient=patient_profile,
                appointment_date=f"2026-08-{i:02d}",
                appointment_time="10:00:00",
                status="COMPLETED"
            )
            Prescription.objects.create(
                appointment=apt,
                doctor=doctor_profile,
                patient=patient_profile,
                symptoms=f"Symptom {i}",
                observations=f"Observation {i}",
                prescription_text=f"Medicine {i}"
            )

        response = doctor_client.post(f"/api/ai-assistant/patients/{patient_profile.id}/summary/")
        assert response.status_code == status.HTTP_200_OK
        assert mock_llm.called

        history_arg = mock_llm.call_args[0][0][0]
        # Most recent prescriptions are 12 down to 3 (10 items)
        assert "Medicine 12" in history_arg
        assert "Medicine 3" in history_arg
        # Oldest prescriptions (1 and 2) must not be included
        assert "Medicine 1." not in history_arg and "Medicine 1\n" not in history_arg
        assert "Medicine 2." not in history_arg and "Medicine 2\n" not in history_arg

    # 29. Non-doctor role cannot access patient summary endpoint
    def test_non_doctor_role_cannot_access_patient_summary_endpoint(
        self, patient_client_1, patient_user_1
    ):
        patient_profile = patient_user_1.patient_profile
        response = patient_client_1.post(f"/api/ai-assistant/patients/{patient_profile.id}/summary/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Unauthenticated request
        anonymous_client = APIClient()
        response = anonymous_client.post(f"/api/ai-assistant/patients/{patient_profile.id}/summary/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
