from rest_framework import serializers
from .models import Supplier, Drug, Batch

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class DrugSerializer(serializers.ModelSerializer):
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Drug
        fields = '__all__'

    def get_total_stock(self, obj):
        # Calculate active remaining stock across all non-disposed, non-expired batches
        import datetime
        active_batches = obj.batches.filter(
            is_disposed=False, 
            expiry_date__gt=datetime.date.today()
        )
        return sum(batch.quantity_remaining for batch in active_batches)

class BatchSerializer(serializers.ModelSerializer):
    drug_details = DrugSerializer(source='drug', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)

    class Meta:
        model = Batch
        fields = '__all__'
