from django.db import models
from users.models import CustomUser
from orders.models import Order


class Payment(models.Model):
    STATUS_CHOICES = [
        ('created',  'Created'),
        ('pending',  'Pending'),
        ('success',  'Success'),
        ('failed',   'Failed'),
        ('refunded', 'Refunded'),
    ]

    order              = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user               = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments')
    razorpay_order_id  = models.CharField(max_length=200, unique=True)
    razorpay_payment_id = models.CharField(max_length=200, blank=True)
    razorpay_signature = models.CharField(max_length=500, blank=True)
    amount             = models.DecimalField(max_digits=10, decimal_places=2)
    currency           = models.CharField(max_length=10, default='INR')
    status             = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} — {self.status}"