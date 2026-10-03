from rest_framework import serializers
from .models import Coupon, CouponUsage
from django.utils import timezone


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value',
                  'min_order_value', 'max_discount', 'valid_until']


class CouponApplySerializer(serializers.Serializer):
    code        = serializers.CharField(max_length=50)
    cart_total  = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, attrs):
        code       = attrs['code'].upper()
        cart_total = attrs['cart_total']
        user       = self.context['request'].user

        # check coupon exists
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({'code': 'Invalid coupon code'})

        # check coupon is valid
        if not coupon.is_valid():
            raise serializers.ValidationError({'code': 'Coupon is expired or inactive'})

        # check minimum order value
        if cart_total < coupon.min_order_value:
            raise serializers.ValidationError({
                'code': f'Minimum order value is ₹{coupon.min_order_value}'
            })

        # check if user already used this coupon
        if CouponUsage.objects.filter(coupon=coupon, user=user).exists():
            raise serializers.ValidationError({'code': 'You have already used this coupon'})

        # calculate discount
        if coupon.discount_type == 'flat':
            discount = coupon.discount_value
        else:
            discount = (cart_total * coupon.discount_value) / 100
            if coupon.max_discount:
                discount = min(discount, coupon.max_discount)

        attrs['coupon']    = coupon
        attrs['discount']  = round(discount, 2)
        attrs['final_total'] = round(cart_total - discount, 2)
        return attrs