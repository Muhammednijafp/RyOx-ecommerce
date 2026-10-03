from django.urls import path
from .views import WishlistView, WishlistItemView

urlpatterns = [
    path('',          WishlistView.as_view(),     name='wishlist'),
    path('<int:pk>/', WishlistItemView.as_view(),  name='wishlist-item'),
]