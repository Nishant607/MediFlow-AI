from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsAdmin
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.notifications.tasks import send_appointment_reminders


class MyNotificationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class MarkNotificationReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response(
            {"message": "Marked as read."},
            status=status.HTTP_200_OK
        )


class MarkAllReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        return Response(
            {
                "message": "All notifications marked as read.",
                "count": updated_count
            },
            status=status.HTTP_200_OK
        )


class TriggerRemindersView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        if getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False):
            count = send_appointment_reminders()
            return Response(
                {
                    "message": f"Reminders sent for {count} appointment(s).",
                    "count": count
                },
                status=status.HTTP_200_OK
            )
        else:
            task_res = send_appointment_reminders.delay()
            return Response(
                {
                    "message": "Appointment reminders background task triggered successfully.",
                    "task_id": str(task_res.id)
                },
                status=status.HTTP_202_ACCEPTED
            )
