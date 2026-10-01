from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    """Allows access only to authenticated users with role='patient'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'patient'
        )


class IsDoctor(BasePermission):
    """Allows access only to authenticated users with role='doctor'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'doctor'
        )


class IsAdmin(BasePermission):
    """Allows access only to authenticated users with role='admin' or is_staff=True."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff)
        )


class IsApprovedDoctor(BasePermission):
    """Allows access only to authenticated doctors whose profile has is_approved=True."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.role == 'doctor'):
            return False
        return bool(
            hasattr(request.user, 'doctor_profile') and
            request.user.doctor_profile.is_approved is True
        )
