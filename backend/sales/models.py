from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from inventory.models import Batch

class Sale(models.Model):
    PAYMENT_CHOICES = (
        ('CASH', 'Cash'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('INSURANCE', 'NHIF Insurance'),
        ('SPLIT', 'Split Payment'),
    )
    
    invoice_number = models.CharField(max_length=50, unique=True)
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='CASH')
    payment_reference = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. M-Pesa reference code")
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    
    # TRA Virtual Fiscal Device (VFD) Fields
    tra_vfd_receipt_number = models.CharField(max_length=100, blank=True, null=True)
    tra_vfd_verification_url = models.URLField(max_length=500, blank=True, null=True)
    tra_vfd_signed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.total_amount} TZS"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT, related_name='sale_items')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    # We record unit prices at time of sale to preserve historical financial reports
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]) # Purchase price at sale time
    total_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])

    def __str__(self):
        return f"{self.batch.drug.generic_name} (x{self.quantity}) on {self.sale.invoice_number}"

class NHIFClaim(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Submission'),
        ('SUBMITTED', 'Submitted to NHIF'),
        ('APPROVED', 'Approved / Paid'),
        ('REJECTED', 'Rejected'),
    )
    
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, related_name='nhif_claim')
    card_number = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=200)
    authorization_code = models.CharField(max_length=50, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"NHIF Claim for {self.patient_name} - Card: {self.card_number}"
