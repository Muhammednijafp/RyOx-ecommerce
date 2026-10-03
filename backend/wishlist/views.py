from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from products.models import Product


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_or_create_wishlist(self, user):
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        return wishlist

    # GET — view wishlist
    def get(self, request):
        wishlist   = self.get_or_create_wishlist(request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

    # POST — add product to wishlist
    def post(self, request):
        wishlist   = self.get_or_create_wishlist(request.user)
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product
        )
        if not created:
            return Response({'message': 'Already in wishlist'}, status=400)

        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)


class WishlistItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # DELETE — remove single item
    def delete(self, request, pk):
        try:
            item = WishlistItem.objects.get(id=pk, wishlist__user=request.user)
            item.delete()
            return Response({'message': 'Removed from wishlist'})
        except WishlistItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)