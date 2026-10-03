from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer
from products.models import Product


class ProductReviewListView(generics.ListAPIView):
    serializer_class   = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return Review.objects.filter(
            product__id=product_id
        ).select_related('user')


class ReviewCreateView(generics.CreateAPIView):
    serializer_class   = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReviewDeleteView(generics.DestroyAPIView):
    serializer_class   = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)