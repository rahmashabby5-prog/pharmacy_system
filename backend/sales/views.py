from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.utils import timezone
from decimal import Decimal
import datetime
import uuid

from .models import Sale, SaleItem, NHIFClaim
from .serializers import SaleSerializer
from .vfd_simulator import TRAVFDSimulator
from inventory.models import Drug, Batch

class SaleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def checkout(self, request):
        data = request.data
        items_data = data.get('items', [])
        payment_method = data.get('payment_method', 'CASH')
        payment_reference = data.get('payment_reference', '')
        discount_amount = Decimal(data.get('discount_amount', '0.00'))
        
        # NHIF fields
        nhif_card_number = data.get('nhif_card_number', '')
        nhif_patient_name = data.get('nhif_patient_name', '')
        nhif_auth_code = data.get('nhif_auth_code', '')

        if not items_data:
            return Response({"error": "No items provided in cart."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Pre-calculate totals
                subtotal = Decimal('0.00')
                tax_total = Decimal('0.00')
                sale_items_to_create = []
                batches_to_update = []

                for item in items_data:
                    drug_id = item.get('drug_id')
                    quantity_needed = int(item.get('quantity', 0))

                    if quantity_needed <= 0:
                        continue

                    try:
                        drug = Drug.objects.get(id=drug_id)
                    except Drug.DoesNotExist:
                        return Response({"error": f"Drug ID {drug_id} does not exist."}, status=status.HTTP_400_BAD_REQUEST)

                    # Get active, non-expired, non-disposed batches sorted by expiry (FEFO)
                    active_batches = Batch.objects.filter(
                        drug=drug,
                        is_disposed=False,
                        expiry_date__gt=datetime.date.today(),
                        quantity_remaining__gt=0
                    ).order_by('expiry_date')

                    total_available = sum(b.quantity_remaining for b in active_batches)
                    if total_available < quantity_needed:
                        return Response({
                            "error": f"Insufficient stock for {drug.generic_name}. Requested {quantity_needed}, only {total_available} available."
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Allocate stock using FEFO
                    allocated_qty = 0
                    for batch in active_batches:
                        if allocated_qty >= quantity_needed:
                            break

                        qty_to_take = min(batch.quantity_remaining, quantity_needed - allocated_qty)
                        
                        # Calculate item price and tax
                        item_retail = batch.retail_price
                        item_cost = batch.cost_price
                        item_total = item_retail * qty_to_take
                        
                        # Tax calculation based on drug tax class
                        item_tax = Decimal('0.00')
                        if drug.tax_class == 'VAT_18':
                            # Tax is inclusive of retail price (18% / 118%)
                            item_tax = item_total - (item_total / Decimal('1.18'))
                        
                        subtotal += item_total
                        tax_total += item_tax
                        allocated_qty += qty_to_take

                        # Prepare update batch object
                        batch.quantity_remaining -= qty_to_take
                        batches_to_update.append(batch)

                        # Create SaleItem record
                        sale_items_to_create.append({
                            'batch': batch,
                            'quantity': qty_to_take,
                            'unit_price': item_retail,
                            'cost_price': item_cost,
                            'total_price': item_total
                        })

                # Calculate final totals
                # For simplified logic: subtotal includes taxes already, total is subtotal - discount
                total_amount = subtotal - discount_amount
                if total_amount < 0:
                    total_amount = Decimal('0.00')

                # Save Sale
                invoice_no = f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
                sale = Sale.objects.create(
                    invoice_number=invoice_no,
                    cashier=request.user,
                    payment_method=payment_method,
                    payment_reference=payment_reference,
                    subtotal=subtotal,
                    tax_amount=tax_total,
                    discount_amount=discount_amount,
                    total_amount=total_amount
                )

                # Save Sale Items and Update Batches
                for item_dict in sale_items_to_create:
                    SaleItem.objects.create(
                        sale=sale,
                        batch=item_dict['batch'],
                        quantity=item_dict['quantity'],
                        unit_price=item_dict['unit_price'],
                        cost_price=item_dict['cost_price'],
                        total_price=item_dict['total_price']
                    )

                for batch in batches_to_update:
                    batch.save()

                # Create NHIF Claim if needed
                if payment_method == 'INSURANCE' or (nhif_card_number and nhif_patient_name):
                    NHIFClaim.objects.create(
                        sale=sale,
                        card_number=nhif_card_number,
                        patient_name=nhif_patient_name,
                        authorization_code=nhif_auth_code,
                        status='PENDING'
                    )

                # Call TRA VFD Mock service
                vfd_response = TRAVFDSimulator.sign_receipt(sale.id, total_amount)
                if vfd_response['status'] == 'SUCCESS':
                    sale.tra_vfd_receipt_number = vfd_response['receipt_number']
                    sale.tra_vfd_verification_url = vfd_response['verification_url']
                    sale.tra_vfd_signed = True
                    sale.save()

                serializer = self.get_serializer(sale)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Checkout failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard_stats(self, request):
        """
        Returns stats for the main dashboard widget.
        """
        today = datetime.date.today()
        
        # Today's Sales
        today_sales = Sale.objects.filter(created_at__date=today)
        revenue_today = today_sales.aggregate(total=models.Sum('total_amount'))['total'] or Decimal('0.00')
        transactions_today = today_sales.count()

        # Expiring Drugs Count (< 6 months)
        six_months_future = today + datetime.timedelta(days=180)
        expiring_batches_count = Batch.objects.filter(
            is_disposed=False,
            expiry_date__gt=today,
            expiry_date__lte=six_months_future
        ).count()

        # Expired Drugs Count (un-disposed)
        expired_batches_count = Batch.objects.filter(
            is_disposed=False,
            expiry_date__lte=today
        ).count()

        # Low Stock Drugs Count
        all_drugs = Drug.objects.all()
        low_stock_count = 0
        for drug in all_drugs:
            active_batches = drug.batches.filter(
                is_disposed=False, 
                expiry_date__gt=today
            )
            total = sum(b.quantity_remaining for b in active_batches)
            if total <= drug.reorder_level:
                low_stock_count += 1

        return Response({
            "revenue_today": float(revenue_today),
            "transactions_today": transactions_today,
            "expiring_batches_count": expiring_batches_count,
            "expired_batches_count": expired_batches_count,
            "low_stock_count": low_stock_count
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def financial_report(self, request):
        """
        Custom report details for owner to see cost, revenue, profit, and tax details.
        """
        # Owners only access check
        if request.user.role != 'OWNER':
            return Response({"error": "Unauthorized. Owner role required."}, status=status.HTTP_403_FORBIDDEN)

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            # Default to last 30 days
            end_date = datetime.date.today()
            start_date = end_date - datetime.timedelta(days=30)
        else:
            start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()

        sales = Sale.objects.filter(created_at__date__range=[start_date, end_date])
        
        total_revenue = sales.aggregate(total=models.Sum('total_amount'))['total'] or Decimal('0.00')
        total_tax = sales.aggregate(total=models.Sum('tax_amount'))['total'] or Decimal('0.00')
        total_discount = sales.aggregate(total=models.Sum('discount_amount'))['total'] or Decimal('0.00')

        # Calculate COGS (Cost of Goods Sold) based on historical batch cost prices at time of sale
        total_cogs = Decimal('0.00')
        sale_items = SaleItem.objects.filter(sale__created_at__date__range=[start_date, end_date])
        for item in sale_items:
            total_cogs += item.cost_price * item.quantity

        gross_profit = total_revenue - total_cogs
        profit_margin = 0.0
        if total_revenue > 0:
            profit_margin = float((gross_profit / total_revenue) * 100)

        return Response({
            "start_date": str(start_date),
            "end_date": str(end_date),
            "total_revenue": float(total_revenue),
            "total_cogs": float(total_cogs),
            "gross_profit": float(gross_profit),
            "profit_margin_percent": round(profit_margin, 2),
            "total_tax_collected": float(total_tax),
            "total_discount_given": float(total_discount),
            "total_transactions": sales.count()
        })
