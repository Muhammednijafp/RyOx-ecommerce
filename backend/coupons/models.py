from django.db import models
from users.models import CustomUser


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('flat',    'Flat Amount Off'),
        ('percent', 'Percentage Off'),
    ]
    code            = models.CharField(max_length=50, unique=True)
    discount_type   = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='flat')
    discount_value  = models.DecimalField(max_digits=10, decimal_places=2)  # amount or percent
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # cap for percent
    is_active       = models.BooleanField(default=True)
    valid_from      = models.DateTimeField()
    valid_until     = models.DateTimeField()
    usage_limit     = models.PositiveIntegerField(default=1)  # total times it can be used
    used_count      = models.PositiveIntegerField(default=0)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} ({self.discount_type} - {self.discount_value})"

    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            self.used_count < self.usage_limit
        )


class CouponUsage(models.Model):
    coupon  = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user    = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='coupon_usages')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('coupon', 'user')  # one coupon per user

    def __str__(self):
        return f"{self.user.email} used {self.coupon.code}"