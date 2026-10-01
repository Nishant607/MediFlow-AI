import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)


def extract_text(file_field) -> str:
    """
    Extract text from a Django FileField or file object.
    Supports .pdf and .txt files. Returns empty string on any error.
    """
    filename = getattr(file_field, 'name', '') or ''
    filename_lower = filename.lower()

    try:
        if filename_lower.endswith('.pdf'):
            reader = PdfReader(file_field)
            extracted_pages = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_pages.append(text)
            return "\n".join(extracted_pages)
        elif filename_lower.endswith('.txt'):
            file_field.seek(0)
            content = file_field.read()
            if isinstance(content, bytes):
                return content.decode('utf-8', errors='ignore')
            return str(content)
        else:
            logger.warning(f"Unsupported file extension for text extraction: {filename}")
            return ""
    except Exception as e:
        logger.error(f"Failed to extract text from file {filename}: {str(e)}", exc_info=True)
        return ""
