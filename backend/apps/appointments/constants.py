import os
import sys
from datetime import time

CLINIC_START_TIME = time(9, 0)
CLINIC_END_TIME = time(17, 0)
SLOT_DURATION_MINUTES = 30

# Dev/Testing convenience toggle:
# When ALLOW_ALL_DAYS is True, clinic is open 7 days a week (including Sundays) and all time slots today are bookable for test convenience.
# To restore production behavior (closed on Sundays, no past slots today), set ALLOW_ALL_DAYS = False.
IS_PYTEST = any('pytest' in arg for arg in sys.argv)
ALLOW_ALL_DAYS = os.environ.get('ALLOW_ALL_DAYS', 'True').lower() in ('true', '1') and not IS_PYTEST

CLINIC_CLOSED_WEEKDAY = -1 if ALLOW_ALL_DAYS else 6  # 0=Monday, 6=Sunday, -1=Never closed

