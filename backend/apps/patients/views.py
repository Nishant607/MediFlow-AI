from django.db.models import Q
from rest_framework import generics
from apps.patients.models import PatientProfile
from apps.patients.serializers import AdminPatientListSerializer
from apps.users.permissions import IsAdmin


class AdminPatientListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminPatientListSerializer

    def get_queryset(self):
        queryset = PatientProfile.objects.select_related('user').order_by('-user__created_at')
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset
