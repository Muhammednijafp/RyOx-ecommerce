from django.db import models
from users.models import CustomUser


class Notification(models.Model):
    TYPE_CHOICES = [
        ('order',     'Order Update'),
        ('promo',     'Promotion'),
        ('review',    'Review'),
        ('system',    'System'),
        ('wishlist',  'Wishlist'),
    ]
    user       = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} — {self.title}"