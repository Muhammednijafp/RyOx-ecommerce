from django.urls import path
from .views import (
    CategoryListView, ScentNoteListView,
    ProductListView, ProductDetailView
)

urlpatterns = [
    path('categories/',        CategoryListView.as_view(),  name='category-list'),
    path('scent-notes/',       ScentNoteListView.as_view(), name='scent-note-list'),
    path('',                   ProductListView.as_view(),   name='product-list'),
    path('<slug:slug>/',       ProductDetailView.as_view(), name='product-detail'),
]