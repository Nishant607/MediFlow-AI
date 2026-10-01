import os
from django.core.exceptions import ValidationError

ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.jpg', '.jpeg', '.png']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_report_file(file):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"File extension '{ext}' is not allowed. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("File size exceeds maximum limit of 10 MB.")
