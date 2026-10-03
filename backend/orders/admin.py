from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderAdmin(admin.ModelAdmin):
    list_display  = ['id', 'user', 'status', 'tracking_number', 'courier_partner', 'estimated_delivery', 'final_amount', 'is_paid', 'created_at']
    list_filter   = ['status', 'is_paid', 'payment_method', 'courier_partner']
    search_fields = ['id', 'user__email', 'tracking_number', 'coupon_code']
    inlines       = [OrderItemInline]


admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)