from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import (
    PatientRegisterView,
    DoctorRegisterView,
    CustomTokenObtainPairView,
    UserMeView,
    AdminStatsView
)

urlpatterns = [
    path('register/patient/', PatientRegisterView.as_view(), name='register-patient'),
    path('register/doctor/', DoctorRegisterView.as_view(), name='register-doctor'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', UserMeView.as_view(), name='user-me'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
]
