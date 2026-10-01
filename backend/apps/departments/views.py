from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.departments.models import Department, EmergencyContact
from apps.users.serializers import DepartmentSerializer
from apps.departments.serializers import EmergencyContactSerializer


class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


class EmergencyContactListView(generics.ListAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(is_active=True)
