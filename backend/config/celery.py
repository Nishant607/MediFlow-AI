import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.timezone = 'Asia/Kolkata'
app.conf.enable_utc = False
app.conf.beat_schedule = {
    'send-daily-appointment-reminders': {
        'task': 'apps.notifications.tasks.send_appointment_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
}
