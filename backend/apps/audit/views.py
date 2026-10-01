from rest_framework import generics, views, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.users.permissions import IsAdmin


class HealthCheckView(views.APIView):
    """
    GET /api/health/ — Returns database connectivity status.
    No authentication required (needed by monitoring tools and uptime checkers).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            from django.db import connection
            connection.ensure_connection()
            return Response({'status': 'ok', 'database': 'ok'}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'status': 'error', 'database': 'unreachable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class AuditLogListView(generics.ListAPIView):
    """
    GET /api/audit/logs/?action=<optional>
    Admin-only. Returns the most recent 100 audit log entries, optionally filtered by action type.
    Note: pagination UI is a future enhancement for very large log volumes.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = AuditLog.objects.order_by('-timestamp')
        action = self.request.query_params.get('action', '').strip()
        if action:
            qs = qs.filter(action=action)
        return qs[:100]
