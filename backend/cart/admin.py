from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


class CartAdmin(admin.ModelAdmin):
    list_display  = ['user', 'total_items', 'total_price', 'updated_at']
    search_fields = ['user__email']
    inlines       = [CartItemInline]


admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem)