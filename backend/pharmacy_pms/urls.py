from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

# Import ViewSets directly to route through a single project-level Router
# This avoids the "Converter 'drf_format_suffix' is already registered" ValueError in Django 6.0.
from inventory.views import SupplierViewSet, DrugViewSet, BatchViewSet
from sales.views import SaleViewSet

router = DefaultRouter()
router.register(r'inventory/suppliers', SupplierViewSet, basename='supplier')
router.register(r'inventory/drugs', DrugViewSet, basename='drug')
router.register(r'inventory/batches', BatchViewSet, basename='batch')
router.register(r'sales/history', SaleViewSet, basename='sale')

def api_root(request):
    return JsonResponse({
        "message": "Pharmacy Management System API is running successfully!",
        "status": "healthy",
        "endpoints": {
            "admin": "/admin/",
            "users": "/api/users/",
            "api_root": "/api/"
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/', include(router.urls)),
]

