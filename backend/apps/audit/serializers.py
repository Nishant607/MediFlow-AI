from rest_framework import serializers
from apps.audit.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ('id', 'user_email', 'action', 'ip_address', 'timestamp')

    def get_user_email(self, obj):
        if obj.user:
            return obj.user.email
        return 'Anonymous'
