from django.urls import path
from apps.notifications.views import (
    MyNotificationsView,
    MarkNotificationReadView,
    MarkAllReadView,
    TriggerRemindersView
)

urlpatterns = [
    path('mine/', MyNotificationsView.as_view(), name='my-notifications'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark-all-read'),
    path('trigger-reminders/', TriggerRemindersView.as_view(), name='trigger-reminders'),
]
