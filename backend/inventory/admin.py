from django.contrib import admin
from .models import Supplier, Drug, Batch

admin.site.register(Supplier)
admin.site.register(Drug)
admin.site.register(Batch)
