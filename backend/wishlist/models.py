from django.db import models
from users.models import CustomUser
from products.models import Product


class Wishlist(models.Model):
    user       = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist of {self.user.email}"

    def total_items(self):
        return self.items.count()


class WishlistItem(models.Model):
    wishlist   = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product')  # no duplicate products in wishlist
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s wishlist"