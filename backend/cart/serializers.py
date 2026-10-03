from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    variant  = ProductVariantSerializer(read_only=True)
    variant_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()
    product  = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ['id', 'variant', 'variant_id', 'quantity', 'subtotal', 'product']

    def get_subtotal(self, obj):
        return str(obj.subtotal())

    def get_product(self, obj):
        if not obj.variant or not obj.variant.product:
            return None
        product = obj.variant.product
        primary_image_obj = product.images.filter(is_primary=True).first() or product.images.first()
        image_url = None
        if primary_image_obj and primary_image_obj.image:
            request = self.context.get('request')
            if request:
                image_url = request.build_absolute_uri(primary_image_obj.image.url)
            else:
                image_url = primary_image_obj.image.url

        return {
            'id':            product.id,
            'name':          product.name,
            'slug':          product.slug,
            'primary_image': image_url,
        }


class CartSerializer(serializers.ModelSerializer):
    items       = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model  = Cart
        fields = ['id', 'items', 'total_price', 'total_items', 'updated_at']

    def get_total_price(self, obj):
        return str(obj.total_price())

    def get_total_items(self, obj):
        return obj.total_items()