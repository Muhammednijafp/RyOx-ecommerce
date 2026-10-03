from django.contrib import admin
from .models import Review


class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['user', 'product', 'rating', 'is_verified', 'created_at']
    list_filter   = ['rating', 'is_verified']
    search_fields = ['user__email', 'product__name', 'title']


admin.site.register(Review, ReviewAdmin)