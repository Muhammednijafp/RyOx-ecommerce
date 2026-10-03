from django.urls import path
from .views import CreateRazorpayOrderView, VerifyPaymentView, PaymentFailedView

urlpatterns = [
    path('create/',  CreateRazorpayOrderView.as_view(), name='create-payment'),
    path('verify/',  VerifyPaymentView.as_view(),       name='verify-payment'),
    path('failed/',  PaymentFailedView.as_view(),       name='payment-failed'),
]