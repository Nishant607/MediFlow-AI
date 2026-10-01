import pytest
from apps.users.models import User


@pytest.mark.django_db
def test_create_user_without_email_raises_value_error():
    with pytest.raises(ValueError, match='Users must have an email address'):
        User.objects.create_user(email='', password='password123')


@pytest.mark.django_db
def test_create_superuser_success():
    admin = User.objects.create_superuser(
        email='admin@example.com',
        password='adminpassword',
        full_name='Super Admin'
    )
    assert admin.is_staff is True
    assert admin.is_superuser is True
    assert admin.role == 'admin'
    assert str(admin) == 'admin@example.com (admin)'


@pytest.mark.django_db
def test_create_superuser_invalid_flags():
    with pytest.raises(ValueError, match='Superuser must have is_staff=True'):
        User.objects.create_superuser(email='a1@ex.com', password='p', is_staff=False)

    with pytest.raises(ValueError, match='Superuser must have is_superuser=True'):
        User.objects.create_superuser(email='a2@ex.com', password='p', is_superuser=False)
