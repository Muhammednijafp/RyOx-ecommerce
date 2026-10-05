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

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            from notifications.models import Notification
            status_labels = {
                'confirmed': 'Order Confirmed',
                'processing': 'Order is being prepared',
                'shipped': f'Order Shipped via {obj.courier_partner}',
                'delivered': 'Order Delivered 🎉',
                'cancelled': 'Order Cancelled',
                'returned': 'Order Returned'
            }
            title = status_labels.get(obj.status, f'Order Status: {obj.status.capitalize()}')
            message = f'Your order #{obj.id} status has been updated to {obj.status.capitalize()}. Tracking ID: {obj.tracking_number or "N/A"}'
            if obj.user:
                Notification.objects.create(
                    user=obj.user,
                    type='order',
                    title=title,
                    message=message
                )
        super().save_model(request, obj, form, change)


admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)