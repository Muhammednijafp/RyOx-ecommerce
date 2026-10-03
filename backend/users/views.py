from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, Address, PasswordResetToken
from .serializers import RegisterSerializer, UserSerializer, AddressSerializer, MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset           = CustomUser.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=400)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user  = CustomUser.objects.get(email=email)
            token = PasswordResetToken.objects.create(user=user)

            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_link = f"{frontend_url}/reset-password?token={token.token}"

            send_mail(
                subject = 'Reset Your RyOx Password',
                message = f'''
Hi {user.full_name},

You requested to reset your RyOx password.

Click the link below to reset it (valid for 15 minutes):
{reset_link}

If you did not request this, ignore this email.

— RyOx Team
                ''',
                from_email     = settings.DEFAULT_FROM_EMAIL,
                recipient_list = [email],
                fail_silently  = False,
            )
        except CustomUser.DoesNotExist:
            pass  # don't reveal if email exists

        return Response({
            'message': 'If this email exists, a reset link has been sent.'
        })


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token     = request.data.get('token')
        password  = request.data.get('password')
        password2 = request.data.get('password2')

        if password != password2:
            return Response({'error': 'Passwords do not match'}, status=400)

        if len(password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=400)

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid reset link'}, status=400)

        if not reset_token.is_valid():
            return Response({'error': 'Reset link has expired'}, status=400)

        user = reset_token.user
        user.set_password(password)
        user.save()

        reset_token.is_used = True
        reset_token.save()

        return Response({'message': 'Password reset successful! Please login.'})