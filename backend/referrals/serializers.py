from rest_framework import serializers

from .models import Referral


class ReferralSerializer(serializers.ModelSerializer):
    referrer_username = serializers.CharField(
        source="referrer.username",
        read_only=True
    )

    referred_username = serializers.CharField(
        source="referred_user.username",
        read_only=True
    )

    class Meta:
        model = Referral
        fields = [
            "id",
            "referral_code",
            "referrer_username",
            "referred_username",
            "created_at",
            "is_rewarded",
        ]
        read_only_fields = [
            "id",
            "referral_code",
            "referrer_username",
            "referred_username",
            "created_at",
            "is_rewarded",
        ]