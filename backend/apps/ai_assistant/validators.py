import os
from django.core.exceptions import ValidationError

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


def validate_kb_file(file):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf', '.txt']:
        raise ValidationError('Only .pdf and .txt files are allowed for knowledge base documents.')

    if file.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError('File size exceeds the maximum allowed limit of 5MB.')
