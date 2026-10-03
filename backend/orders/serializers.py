from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductVariantSerializer
from users.serializers import AddressSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    variant  = ProductVariantSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    product  = serializers.SerializerMethodField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'variant', 'quantity', 'price', 'subtotal', 'product']

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


class OrderSerializer(serializers.ModelSerializer):
    items   = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'status', 'items', 'address',
            'total_amount', 'discount_amount', 'final_amount',
            'coupon_code', 'payment_method', 'is_paid',
            'tracking_number', 'courier_partner', 'estimated_delivery',
            'created_at'
        ]


class PlaceOrderSerializer(serializers.Serializer):
    address_id     = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['cod', 'online'])
    coupon_code    = serializers.CharField(required=False, allow_blank=True)

    def validate_address_id(self, value):
        user = self.context['request'].user
        from users.models import Address
        try:
            Address.objects.get(id=value, user=user)
        except:
            raise serializers.ValidationError('Address not found')
        return value

    def create(self, validated_data):
        from cart.models import Cart
        from users.models import Address
        from coupons.models import Coupon, CouponUsage
        from notifications.models import Notification
        from django.utils import timezone
        import random, string

        user    = self.context['request'].user
        address = Address.objects.get(id=validated_data['address_id'])

        # get cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError('Cart is empty')

        cart_items = cart.items.all()
        if not cart_items.exists():
            raise serializers.ValidationError('Cart is empty')

        # calculate total
        total = sum(item.subtotal() for item in cart_items)

        # apply coupon if any
        discount    = 0
        coupon_code = validated_data.get('coupon_code', '')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.upper())
                if coupon.is_valid():
                    if coupon.discount_type == 'flat':
                        discount = coupon.discount_value
                    else:
                        discount = (total * coupon.discount_value) / 100
                        if coupon.max_discount:
                            discount = min(discount, coupon.max_discount)
                    # mark coupon as used
                    coupon.used_count += 1
                    coupon.save()
                    CouponUsage.objects.create(coupon=coupon, user=user)
            except Coupon.DoesNotExist:
                pass

        final_amount = max(0, total - discount)

        # generate tracking number
        random_suffix = ''.join(random.choices(string.digits, k=6))
        tracking_num  = f"RYX-{random_suffix}-IN"
        est_delivery  = timezone.now().date() + timezone.timedelta(days=5)

        # create order
        order = Order.objects.create(
            user               = user,
            address            = address,
            total_amount       = total,
            discount_amount     = discount,
            final_amount       = final_amount,
            coupon_code        = coupon_code,
            payment_method     = validated_data['payment_method'],
            is_paid            = validated_data['payment_method'] == 'cod',
            tracking_number    = tracking_num,
            courier_partner    = "RyOx Express Logistics",
            estimated_delivery = est_delivery,
        )

        # create order items and reduce stock
        for item in cart_items:
            OrderItem.objects.create(
                order    = order,
                variant  = item.variant,
                quantity = item.quantity,
                price    = item.variant.selling_price,
            )
            # reduce stock
            item.variant.stock -= item.quantity
            item.variant.save()

        # clear cart
        cart.items.all().delete()

        # create notification
        Notification.objects.create(
            user    = user,
            type    = 'order',
            title   = 'Order Placed Successfully!',
            message = f'Your order #{order.id} has been placed. Tracking ID: {tracking_num}',
        )

        return order