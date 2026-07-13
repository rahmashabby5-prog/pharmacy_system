from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'OWNER')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('OWNER', 'Pharmacy Owner'),
        ('PHARMACIST', 'Pharmacist'),
        ('CASHIER', 'Cashier'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CASHIER')
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    objects = UserManager()

    @property
    def is_owner(self):
        return self.role == 'OWNER'

    @property
    def is_pharmacist(self):
        return self.role == 'PHARMACIST'

    @property
    def is_cashier(self):
        return self.role == 'CASHIER'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
