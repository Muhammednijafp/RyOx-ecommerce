import re
from rest_framework import serializers
from .models import CustomUser, Address


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = CustomUser
        fields = ['email', 'full_name', 'phone', 'password', 'password2']

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("An account with this email already exists. Please log in.")
        return email

    def validate_phone(self, value):
        clean_phone = re.sub(r'\D', '', value)
        if clean_phone and len(clean_phone) > 10:
            clean_phone = clean_phone[-10:]
        return clean_phone

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
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
        name = str(value).strip()
        if len(name) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters long.")
        return name

    def validate_phone(self, value):
        raw = re.sub(r'\D', '', str(value))
        clean = raw[-10:] if len(raw) >= 10 else raw
        if len(clean) != 10:
            raise serializers.ValidationError("Please enter a valid 10-digit mobile number.")
        return clean

    def validate_address_line(self, value):
        addr = str(value).strip()
        if len(addr) < 2:
            raise serializers.ValidationError("Address line must be at least 2 characters long.")
        return addr

    def validate_city(self, value):
        city = str(value).strip()
        if not city:
            raise serializers.ValidationError("City is required.")
        return city

    def validate_state(self, value):
        state = str(value).strip()
        if not state:
            raise serializers.ValidationError("State is required.")
        return state

    def validate_pincode(self, value):
        pin = re.sub(r'\D', '', str(value))
        if len(pin) != 6:
            raise serializers.ValidationError("Please enter a valid 6-digit PIN code.")
        return pin