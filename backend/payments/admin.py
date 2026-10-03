from django.contrib import admin
from .models import Payment


class PaymentAdmin(admin.ModelAdmin):
    list_display  = ['order', 'user', 'amount', 'status',
                     'razorpay_order_id', 'razorpay_payment_id', 'created_at']
    list_filter   = ['status', 'currency']
    search_fields = ['user__email', 'razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = ['razorpay_order_id', 'razorpay_payment_id',
                       'razorpay_signature', 'created_at', 'updated_at']


admin.site.register(Payment, PaymentAdmin)