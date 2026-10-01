import logging
from apps.ai_assistant.models import ReportSummary
from apps.ai_assistant.services.text_extraction import extract_text
from apps.ai_assistant.services.llm_client import get_llm_response

logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = (
    "You are a medical report explainer for patients. Explain the report content in\n"
    "simple, plain language a non-medical person can understand. Describe what values/measurements the report\n"
    "contains. NEVER name a specific disease, diagnosis, or medical condition. NEVER tell the patient what they\n"
    '\"have.\" If a value appears outside a typical range, say only that \"this value appears outside the typical\n'
    'reference range\" and always end by encouraging the patient to discuss the full report with their doctor.\n'
    "Do not guess or infer anything not explicitly stated in the report text."
)

UNEXTRACTABLE_MESSAGE = (
    "This report type can't be automatically summarized yet. "
    "Please view the original file or discuss it with your doctor."
)


def summarize_report(report) -> str:
    """
    Summarize a patient's MedicalReport.
    1. Returns cached summary if already generated.
    2. Returns friendly message if text cannot be extracted (e.g. image).
    3. Truncates text to 6000 characters and queries Groq LLM with medical explainer prompt.
    4. Caches and returns summary.
    """
    # 1. Return cached summary if already exists
    try:
        if hasattr(report, 'ai_summary') and report.ai_summary:
            return report.ai_summary.summary_text
    except Exception:
        pass

    existing_summary = ReportSummary.objects.filter(report=report).first()
    if existing_summary:
        return existing_summary.summary_text

    # 2. Extract text from report file
    extracted_text = extract_text(report.file)
    if not extracted_text or not extracted_text.strip():
        return UNEXTRACTABLE_MESSAGE

    # 3. Truncate text to 6000 characters
    truncated_text = extracted_text[:6000]

    # 4. Call LLM
    reply = get_llm_response(
        [truncated_text],
        "Please explain this medical report in simple language.",
        system_prompt=SUMMARY_SYSTEM_PROMPT
    )

    # 5. Save summary and return
    ReportSummary.objects.create(
        report=report,
        summary_text=reply
    )

    return reply
