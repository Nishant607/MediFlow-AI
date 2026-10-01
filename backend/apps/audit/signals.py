from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver
from .models import AuditLog


def get_client_ip(request):
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@receiver(user_logged_in)
def log_user_logged_in(sender, request, user, **kwargs):
    ip = get_client_ip(request)
    AuditLog.objects.create(
        user=user,
        action='LOGIN_SUCCESS',
        ip_address=ip
    )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    ip = get_client_ip(request)
    email = credentials.get('email') or credentials.get('username') if credentials else None
    user = None
    if email:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(email=email).first()

    AuditLog.objects.create(
        user=user,
        action='LOGIN_FAILED',
        ip_address=ip
    )
