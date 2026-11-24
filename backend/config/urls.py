from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from apps.audit.views import HealthCheckView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def root_welcome_view(request):
    return JsonResponse({
        "project": "MediFlow-AI Cloud-Native Hospital System API",
        "status": "online",
        "health_check": "/api/health/",
        "interactive_documentation": "/api/docs/",
        "schema": "/api/schema/",
    })


urlpatterns = [
    path('', root_welcome_view, name='root-welcome'),
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/', include('apps.users.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/medical-records/', include('apps.medical_records.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/ai-assistant/', include('apps.ai_assistant.urls')),
    path('api/audit/', include('apps.audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
