from django.urls import path
from .views import PlaceOrderView, OrderListView, OrderDetailView, CancelOrderView

urlpatterns = [
    path('',              OrderListView.as_view(),   name='order-list'),
    path('place/',        PlaceOrderView.as_view(),  name='place-order'),
    path('<int:pk>/',     OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
]