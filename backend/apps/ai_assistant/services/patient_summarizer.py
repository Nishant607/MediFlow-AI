import logging
from apps.medical_records.models import Prescription
from apps.ai_assistant.services.llm_client import get_llm_response

logger = logging.getLogger(__name__)

PATIENT_HISTORY_SYSTEM_PROMPT = (
    "You are a clinical assistant helping a doctor quickly review a patient's\n"
    "history. Summarize ONLY the information provided below — do not add, infer, or guess anything not stated.\n"
    "Organize your summary under these headings: Previous Conditions/Symptoms, Recent Visits, Current Medications,\n"
    "Important Notes. This is a summary of existing records only, not a new diagnosis or medical opinion."
)

NO_HISTORY_MESSAGE = "No consultation history available yet for this patient."


def summarize_patient_history(patient) -> str:
    """
    Summarize a patient's recent consultation history for a doctor.
    1. Fetches up to the most recent 10 prescriptions.
    2. Returns friendly message without calling LLM if no prescriptions exist.
    3. Builds visit history text block and queries Groq LLM with clinical assistant prompt.
    4. Returns LLM response (not cached).
    """
    prescriptions = list(
        Prescription.objects.filter(patient=patient)
        .select_related('appointment')
        .order_by('-created_at')[:10]
    )

    if not prescriptions:
        return NO_HISTORY_MESSAGE

    paragraphs = []
    for p in prescriptions:
        visit_date = (
            p.appointment.appointment_date
            if p.appointment and hasattr(p.appointment, 'appointment_date')
            else p.created_at.strftime('%Y-%m-%d')
        )
        paragraphs.append(
            f"Visit on {visit_date}: Symptoms: {p.symptoms}. "
            f"Observations: {p.observations}. Prescription: {p.prescription_text}."
        )

    history_text = "\n\n".join(paragraphs)

    return get_llm_response(
        [history_text],
        "Summarize this patient's history for the doctor.",
        system_prompt=PATIENT_HISTORY_SYSTEM_PROMPT
    )
