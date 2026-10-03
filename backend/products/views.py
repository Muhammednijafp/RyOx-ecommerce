from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, ScentNote, Product
from .serializers import (
    CategorySerializer, ScentNoteSerializer, ProductListSerializer
)


class CategoryListView(generics.ListAPIView):
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ScentNoteListView(generics.ListAPIView):
    queryset         = ScentNote.objects.all()
    serializer_class = ScentNoteSerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    serializer_class   = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'description', 'scent_note__name']
    ordering_fields    = ['created_at', 'name']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).prefetch_related(
            'variants', 'images', 'category', 'scent_note'
        )
        # Filter by category slug
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # Filter by scent note
        scent = self.request.query_params.get('scent')
        if scent:
            queryset = queryset.filter(scent_note__name=scent)

        # Filter by tag
        featured    = self.request.query_params.get('featured')
        bestseller  = self.request.query_params.get('bestseller')
        new_arrival = self.request.query_params.get('new_arrival')

        if featured:
            queryset = queryset.filter(is_featured=True)
        if bestseller:
            queryset = queryset.filter(is_bestseller=True)
        if new_arrival:
            queryset = queryset.filter(is_new_arrival=True)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class   = ProductListSerializer
    permission_classes = [AllowAny]
    lookup_field       = 'slug'
    queryset           = Product.objects.filter(is_active=True).prefetch_related(
        'variants', 'images', 'category', 'scent_note'
    )