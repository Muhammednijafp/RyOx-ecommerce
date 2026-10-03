from django.db import models
from users.models import CustomUser
from products.models import Product


class Review(models.Model):
    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]
    user       = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating     = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title      = models.CharField(max_length=150, blank=True)
    body       = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)  # True if user actually bought it
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')  # one review per product per user
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} → {self.product.name} ({self.rating}★)"