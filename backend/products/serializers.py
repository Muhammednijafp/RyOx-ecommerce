from rest_framework import serializers
from .models import Category, ScentNote, Product, ProductVariant, ProductImage, FragranceNote


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'gender', 'slug', 'description']


class ScentNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ScentNote
        fields = ['id', 'name']


class FragranceNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FragranceNote
        fields = ['id', 'note_type', 'name']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = ['id', 'image', 'is_primary', 'alt_text']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model  = ProductVariant
        fields = ['id', 'size_ml', 'mrp', 'selling_price',
                  'stock', 'is_available', 'discount_percent']

    def get_discount_percent(self, obj):
        return obj.discount_percent()


class ProductListSerializer(serializers.ModelSerializer):
    category        = CategorySerializer(read_only=True)
    scent_note      = ScentNoteSerializer(read_only=True)
    fragrance_notes = FragranceNoteSerializer(many=True, read_only=True)
    images          = ProductImageSerializer(many=True, read_only=True)
    variants        = ProductVariantSerializer(many=True, read_only=True)
    primary_image   = serializers.SerializerMethodField()
    starting_price  = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'slug', 'category', 'scent_note',
            'top_notes', 'heart_notes', 'base_notes', 'fragrance_notes',
            'description', 'is_featured', 'is_bestseller',
            'is_new_arrival', 'images', 'variants',
            'primary_image', 'starting_price', 'created_at',
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if image and image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return None

    def get_starting_price(self, obj):
        variant = obj.variants.filter(is_available=True).order_by('selling_price').first()
        if variant:
            return str(variant.selling_price)
        return None