from rest_framework import serializers
from .models import Sale, SaleItem, NHIFClaim

class SaleItemSerializer(serializers.ModelSerializer):
    drug_name = serializers.CharField(source='batch.drug.generic_name', read_only=True)
    brand_name = serializers.CharField(source='batch.drug.brand_name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)

    class Meta:
        model = SaleItem
        fields = '__all__'

class NHIFClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = NHIFClaim
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    nhif_claim = NHIFClaimSerializer(read_only=True)
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'
