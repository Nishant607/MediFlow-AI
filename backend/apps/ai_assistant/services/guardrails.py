EMERGENCY_KEYWORDS = [
    'chest pain', "can't breathe", 'cannot breathe', 'difficulty breathing',
    'severe bleeding', 'unconscious', 'not breathing', 'suicidal', 'want to die',
    'overdose', 'seizure', 'stroke', 'heart attack'
]

EMERGENCY_RESPONSE = (
    "This may be a medical emergency. Please call your local emergency number "
    "or go to the nearest emergency room immediately. If you are in emotional distress, please "
    "reach out to a crisis helpline or a trusted person right away."
)


def is_emergency_message(message: str) -> bool:
    """
    Case-insensitive check whether the user message contains any emergency keyword.
    """
    if not message:
        return False

    msg_lower = message.lower()
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in msg_lower:
            return True
    return False
