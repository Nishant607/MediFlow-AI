from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.departments.models import Department, EmergencyContact
from apps.users.serializers import DepartmentSerializer
from apps.departments.serializers import EmergencyContactSerializer
from apps.users.permissions import IsAdmin


class DepartmentListView(generics.ListCreateAPIView):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]


class EmergencyContactListView(generics.ListAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return EmergencyContact.objects.filter(is_active=True)
