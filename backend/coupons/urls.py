from django.urls import path
from .views import ApplyCouponView, ValidateCouponView

urlpatterns = [
    path('apply/',               ApplyCouponView.as_view(),       name='apply-coupon'),
    path('validate/<str:code>/', ValidateCouponView.as_view(),    name='validate-coupon'),
]