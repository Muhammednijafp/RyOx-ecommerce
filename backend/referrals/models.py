import secrets
import string

from django.db import models
from django.conf import settings


def generate_referral_code():
    """Generate a unique RYOX referral code."""
    while True:
        code = "RYOX" + "".join(
            secrets.choice(string.ascii_uppercase + string.digits)
            for _ in range(8)
        )

        if not Referral.objects.filter(referral_code=code).exists():
            return code


class Referral(models.Model):
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referrals_sent"
    )

    referred_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referral_received",
        null=True,
        blank=True
    )

    referral_code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_referral_code
    )

    created_at = models.DateTimeField(auto_now_add=True)

    is_rewarded = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.referrer.username} - {self.referral_code}"