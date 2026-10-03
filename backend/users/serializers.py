import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, Address


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        raw_email = attrs.get('email') or attrs.get('username') or ''
        email = raw_email.strip().lower()
        password = attrs.get('password') or ''

        if not email:
            raise serializers.ValidationError({'detail': 'Email address is required.'})
        if not password:
            raise serializers.ValidationError({'detail': 'Password is required.'})

        user_obj = CustomUser.objects.filter(email__iexact=email).first()
        if not user_obj:
            raise serializers.ValidationError({'detail': f'No account found with email {email}. Please register.'})

        if not user_obj.check_password(password):
            raise serializers.ValidationError({'detail': 'Incorrect password. Please try again or reset your password.'})

        if not user_obj.is_active:
            raise serializers.ValidationError({'detail': 'This account has been deactivated.'})

        refresh = self.get_token(user_obj)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user_obj).data
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = CustomUser
        fields = ['email', 'full_name', 'phone', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['id', 'email', 'full_name', 'phone', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Address
        fields = ['id', 'full_name', 'phone', 'address_line',
                  'city', 'state', 'pincode', 'is_default']

    def validate_full_name(self, value):
        name = value.strip()
        if len(name) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters long.")
        return name

    def validate_phone(self, value):
        clean_phone = re.sub(r'\D', '', value)
        if not re.match(r'^[6-9]\d{9}$', clean_phone):
            raise serializers.ValidationError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")
        return clean_phone

    def validate_address_line(self, value):
        addr = value.strip()
        if len(addr) < 5:
            raise serializers.ValidationError("Address line must be at least 5 characters long.")
        return addr

    def validate_city(self, value):
        city = value.strip()
        if len(city) < 2:
            raise serializers.ValidationError("City name must be at least 2 characters long.")
        return city

    def validate_state(self, value):
        state = value.strip()
        if len(state) < 2:
            raise serializers.ValidationError("State name must be at least 2 characters long.")
        return state

    def validate_pincode(self, value):
        pin = value.strip()
        if not re.match(r'^[1-9][0-9]{5}$', pin):
            raise serializers.ValidationError("Please enter a valid 6-digit Indian PIN code.")
        return pin