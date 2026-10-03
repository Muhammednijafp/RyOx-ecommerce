from django.db import models
from users.models import CustomUser, Address
from products.models import ProductVariant


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('confirmed',  'Confirmed'),
        ('processing', 'Processing'),
        ('shipped',    'Shipped'),
        ('delivered',  'Delivered'),
        ('cancelled',  'Cancelled'),
        ('returned',   'Returned'),
    ]
    user            = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='orders')
    address         = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount    = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount    = models.DecimalField(max_digits=10, decimal_places=2)
    coupon_code     = models.CharField(max_length=50, blank=True)
    payment_method  = models.CharField(max_length=50, default='cod')
    is_paid         = models.BooleanField(default=False)

    # Order Tracking & Logistics Fields
    tracking_number    = models.CharField(max_length=100, blank=True, null=True, help_text="AWB or Tracking Number")
    courier_partner    = models.CharField(max_length=100, blank=True, default="RyOx Express / Delhivery")
    estimated_delivery = models.DateField(blank=True, null=True, help_text="Estimated Delivery Date")

    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} — {self.user}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant  = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price    = models.DecimalField(max_digits=10, decimal_places=2)  # price at time of order

    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.variant} x {self.quantity}"