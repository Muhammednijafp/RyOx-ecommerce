from django.contrib import admin
from .models import Coupon, CouponUsage


class CouponAdmin(admin.ModelAdmin):
    list_display  = ['code', 'discount_type', 'discount_value', 'is_active',
                     'valid_from', 'valid_until', 'used_count', 'usage_limit']
    list_filter   = ['discount_type', 'is_active']
    search_fields = ['code']


class CouponUsageAdmin(admin.ModelAdmin):
    list_display  = ['coupon', 'user', 'used_at']
    search_fields = ['user__email', 'coupon__code']


admin.site.register(Coupon, CouponAdmin)
admin.site.register(CouponUsage, CouponUsageAdmin)