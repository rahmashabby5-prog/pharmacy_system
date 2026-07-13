from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    # Columns to show in the list view
    list_display = ('username', 'email', 'role', 'phone_number', 'is_staff', 'is_active')
    # Filter users in the sidebar
    list_filter = ('role', 'is_staff', 'is_active')
    
    # Field groupings when editing a user
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Info', {'fields': ('role', 'phone_number')}),
    )
    
    # Field groupings when creating a user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Profile Info', {'fields': ('role', 'phone_number')}),
    )

admin.site.register(User, CustomUserAdmin)
