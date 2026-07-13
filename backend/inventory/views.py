from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
import datetime

from .models import Supplier, Drug, Batch
from .serializers import SupplierSerializer, DrugSerializer, BatchSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

class DrugViewSet(viewsets.ModelViewSet):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        drugs = Drug.objects.filter(
            Q(generic_name__icontains=query) | 
            Q(brand_name__icontains=query)
        )
        serializer = self.get_serializer(drugs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        # We need to filter drugs where the calculated total_stock is below their reorder_level.
        # Since total_stock is a SerializerMethodField, we'll do this in python memory or custom SQL.
        # For small-medium scale (up to a few thousand drugs), filtering in Python is extremely fast.
        all_drugs = Drug.objects.all()
        low_stock_drugs = []
        for drug in all_drugs:
            # Calculate stock
            active_batches = drug.batches.filter(
                is_disposed=False, 
                expiry_date__gt=datetime.date.today()
            )
            total = sum(b.quantity_remaining for b in active_batches)
            if total <= drug.reorder_level:
                drug_data = self.get_serializer(drug).data
                drug_data['total_stock'] = total
                low_stock_drugs.append(drug_data)
        return Response(low_stock_drugs)

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.filter(is_disposed=False)
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def expiring(self, request):
        # Default to 6 months (180 days)
        days = int(request.query_params.get('days', 180))
        today = datetime.date.today()
        future_limit = today + datetime.timedelta(days=days)
        
        # Expiring soon batches
        expiring_batches = Batch.objects.filter(
            is_disposed=False,
            expiry_date__gt=today,
            expiry_date__lte=future_limit
        ).order_by('expiry_date')
        
        serializer = self.get_serializer(expiring_batches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        today = datetime.date.today()
        expired_batches = Batch.objects.filter(
            is_disposed=False,
            expiry_date__lte=today
        ).order_by('expiry_date')
        
        serializer = self.get_serializer(expired_batches, many=True)
        return Response(serializer.data)
