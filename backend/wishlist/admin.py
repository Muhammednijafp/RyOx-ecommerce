from django.contrib import admin
from .models import Wishlist, WishlistItem


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0


class WishlistAdmin(admin.ModelAdmin):
    list_display  = ['user', 'total_items', 'created_at']
    search_fields = ['user__email']
    inlines       = [WishlistItemInline]


admin.site.register(Wishlist, WishlistAdmin)
admin.site.register(WishlistItem)