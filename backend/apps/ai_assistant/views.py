from django.shortcuts import get_object_or_404
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from apps.users.permissions import IsPatient, IsAdmin, IsApprovedDoctor
from apps.audit.models import AuditLog
from apps.audit.signals import get_client_ip

from apps.ai_assistant.models import KnowledgeDocument, DocumentChunk, Message
from apps.ai_assistant.serializers import (
    MessageSerializer,
    KnowledgeDocumentSerializer,
    ChatRequestSerializer
)
from apps.ai_assistant.throttles import AIChatThrottle
from apps.ai_assistant.services.guardrails import is_emergency_message, EMERGENCY_RESPONSE
from apps.ai_assistant.services.retrieval import get_relevant_chunks
from apps.ai_assistant.services.llm_client import get_llm_response
from apps.ai_assistant.services.text_extraction import extract_text
from apps.ai_assistant.services.chunking import split_into_chunks
from apps.ai_assistant.services.report_summarizer import summarize_report
from apps.ai_assistant.services.patient_summarizer import summarize_patient_history
from apps.medical_records.models import MedicalReport
from apps.medical_records.permissions import user_can_access_patient_records
from apps.patients.models import PatientProfile


class ChatView(views.APIView):
    permission_classes = [IsPatient]
    throttle_classes = [AIChatThrottle]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_message = serializer.validated_data['message']

        patient_profile = request.user.patient_profile

        # Save user message
        Message.objects.create(
            patient=patient_profile,
            role='user',
            content=user_message
        )

        # Emergency check
        if is_emergency_message(user_message):
            reply = EMERGENCY_RESPONSE
            grounded = False
        else:
            chunks = get_relevant_chunks(user_message)
            if not chunks:
                reply = (
                    "I don't have specific information about that in our hospital records. "
                    "Please contact the hospital directly for assistance."
                )
                grounded = False
            else:
                reply = get_llm_response(chunks, user_message)
                grounded = True

        # Save assistant message
        Message.objects.create(
            patient=patient_profile,
            role='assistant',
            content=reply
        )

        return Response(
            {
                "reply": reply,
                "grounded": grounded
            },
            status=status.HTTP_200_OK
        )


class MessageHistoryView(generics.ListAPIView):
    permission_classes = [IsPatient]
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(patient=self.request.user.patient_profile)


class DocumentListCreateView(views.APIView):
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        documents = KnowledgeDocument.objects.all().order_by('-created_at')
        serializer = KnowledgeDocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = KnowledgeDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        doc = serializer.save(uploaded_by=request.user)

        # Extract text & chunk
        extracted_text = extract_text(doc.file)
        chunk_texts = split_into_chunks(extracted_text)

        if chunk_texts:
            chunks_to_create = [
                DocumentChunk(
                    document=doc,
                    chunk_text=ct,
                    chunk_index=i
                )
                for i, ct in enumerate(chunk_texts)
            ]
            DocumentChunk.objects.bulk_create(chunks_to_create)

        # Audit log
        AuditLog.objects.create(
            user=request.user,
            action='KB_DOCUMENT_UPLOADED',
            ip_address=get_client_ip(request)
        )

        doc_data = KnowledgeDocumentSerializer(doc).data

        if not extracted_text or not chunk_texts:
            return Response(
                {
                    "message": "Document uploaded, but no readable text could be extracted from it.",
                    "document": doc_data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "message": "Document uploaded and processed successfully.",
                "document": doc_data
            },
            status=status.HTTP_201_CREATED
        )


DocumentListView = DocumentListCreateView
DocumentUploadView = DocumentListCreateView


class ToggleDocumentActiveView(views.APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        doc = get_object_or_404(KnowledgeDocument, pk=pk)
        doc.is_active = not doc.is_active
        doc.save()
        return Response(
            {
                "message": "Document status updated.",
                "is_active": doc.is_active
            },
            status=status.HTTP_200_OK
        )


class DocumentDeleteView(views.APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        doc = get_object_or_404(KnowledgeDocument, pk=pk)
        title = doc.title

        # Create audit log before instance deletion
        AuditLog.objects.create(
            user=request.user,
            action='KB_DOCUMENT_DELETED',
            ip_address=get_client_ip(request)
        )

        doc.delete()
        return Response(
            {"message": f"Document '{title}' deleted successfully."},
            status=status.HTTP_200_OK
        )


class ReportSummaryView(views.APIView):
    permission_classes = [IsPatient]

    def post(self, request, report_id):
        patient_profile = request.user.patient_profile
        report = get_object_or_404(MedicalReport, id=report_id, patient=patient_profile)
        summary = summarize_report(report)
        return Response(
            {
                "summary": summary,
                "report_id": report.id
            },
            status=status.HTTP_200_OK
        )


class PatientHistorySummaryView(views.APIView):
    permission_classes = [IsApprovedDoctor]

    def post(self, request, patient_id):
        patient = get_object_or_404(PatientProfile, id=patient_id)
        if not user_can_access_patient_records(request.user, patient):
            return Response(
                {"detail": "You do not have permission to access this patient's records."},
                status=status.HTTP_403_FORBIDDEN
            )
        summary = summarize_patient_history(patient)
        return Response(
            {"summary": summary},
            status=status.HTTP_200_OK
        )
