from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    MyTokenObtainPairView,
    RegisterView, ProfileView,
    AddressListCreateView, AddressDetailView,
    LogoutView, PasswordResetRequestView,
    PasswordResetConfirmView
)

urlpatterns = [
    path('register/',              RegisterView.as_view(),             name='register'),
    path('login/',                 MyTokenObtainPairView.as_view(),    name='login'),
    path('token/refresh/',         TokenRefreshView.as_view(),         name='token-refresh'),
    path('logout/',                LogoutView.as_view(),               name='logout'),
    path('profile/',               ProfileView.as_view(),              name='profile'),
    path('addresses/',             AddressListCreateView.as_view(),    name='address-list'),
    path('addresses/<int:pk>/',    AddressDetailView.as_view(),        name='address-detail'),
    path('password-reset/',        PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/',PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]