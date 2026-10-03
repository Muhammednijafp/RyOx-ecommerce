from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import ProductVariant


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    # GET — view cart
    def get(self, request):
        cart = self.get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    # POST — add item to cart
    def post(self, request):
        cart       = self.get_or_create_cart(request.user)
        variant_id = request.data.get('variant_id')
        quantity   = int(request.data.get('quantity', 1))

        try:
            variant = ProductVariant.objects.get(id=variant_id, is_available=True)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Product variant not found'}, status=404)

        if quantity > variant.stock:
            return Response({'error': 'Not enough stock'}, status=400)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    # DELETE — clear entire cart
    def delete(self, request):
        cart = self.get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared'})


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # PATCH — update quantity
    def patch(self, request, pk):
        try:
            item     = CartItem.objects.get(id=pk, cart__user=request.user)
            quantity = int(request.data.get('quantity', 1))
            if quantity <= 0:
                item.delete()
                return Response({'message': 'Item removed'})
            if quantity > item.variant.stock:
                return Response({'error': 'Not enough stock'}, status=400)
            item.quantity = quantity
            item.save()
            return Response(CartItemSerializer(item).data)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)

    # DELETE — remove single item
    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(id=pk, cart__user=request.user)
            item.delete()
            return Response({'message': 'Item removed'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)