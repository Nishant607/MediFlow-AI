from django.urls import path
from apps.departments.views import DepartmentListView, EmergencyContactListView

urlpatterns = [
    path('', DepartmentListView.as_view(), name='department-list'),
    path('emergency-contacts/', EmergencyContactListView.as_view(), name='emergency-contact-list'),
]
