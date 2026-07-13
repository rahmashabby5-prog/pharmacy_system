from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    tin_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="TIN Number")
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    payment_terms = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Cash, 30 Days Credit")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Drug(models.Model):
    CATEGORY_CHOICES = (
        ('OTC', 'Over the Counter'),
        ('PRESCRIPTION', 'Prescription Only'),
        ('NARCOTIC', 'Narcotic / Controlled'),
    )
    TAX_CHOICES = (
        ('VAT_18', '18% VAT'),
        ('EXEMPT', 'Exempt'),
        ('ZERO_RATED', 'Zero Rated'),
    )

    generic_name = models.CharField(max_length=200)
    brand_name = models.CharField(max_length=200, blank=True, null=True)
    dosage_form = models.CharField(max_length=100, default='Tablets') # Tablets, Syrup, Injection, etc.
    strength = models.CharField(max_length=50, default='500mg') # 500mg, 10ml, etc.
    pack_size = models.CharField(max_length=100, default='Box of 100') # Box of 100, Bottle, etc.
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='OTC')
    tax_class = models.CharField(max_length=20, choices=TAX_CHOICES, default='EXEMPT')
    reorder_level = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        brand = f" ({self.brand_name})" if self.brand_name else ""
        return f"{self.generic_name}{brand} - {self.dosage_form} {self.strength}"

class Batch(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE, related_name='batches')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    batch_number = models.CharField(max_length=100)
    quantity_received = models.IntegerField(validators=[MinValueValidator(0)])
    quantity_remaining = models.IntegerField(validators=[MinValueValidator(0)])
    
    manufacturing_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField()
    
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]) # Cost per unit
    retail_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]) # Retail price per unit
    
    is_disposed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Batches"
        ordering = ['expiry_date'] # Helps with FEFO ordering natively

    def __str__(self):
        return f"{self.drug.generic_name} (Batch: {self.batch_number}) - Exp: {self.expiry_date}"

    @property
    def is_expired(self):
        import datetime
        return self.expiry_date < datetime.date.today()

    @property
    def days_until_expiry(self):
        import datetime
        delta = self.expiry_date - datetime.date.today()
        return delta.days
