from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user     = UserSerializer(read_only=True)
    rating   = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model  = Review
        fields = ['id', 'user', 'product', 'rating', 'title',
                  'body', 'is_verified', 'created_at']
        read_only_fields = ['id', 'user', 'is_verified', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model  = Review
        fields = ['product', 'rating', 'title', 'body']

    def validate(self, attrs):
        user    = self.context['request'].user
        product = attrs['product']
        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError('You have already reviewed this product')
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user

        # check if user bought this product — mark as verified
        from orders.models import Order
        is_verified = Order.objects.filter(
            user=user,
            status='delivered',
            items__variant__product=validated_data['product']
        ).exists()

        return Review.objects.create(
            user=user,
            is_verified=is_verified,
            **validated_data
        )