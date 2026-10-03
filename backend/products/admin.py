from django.contrib import admin
from django.utils.html import mark_safe
from .models import Category, ScentNote, Product, ProductVariant, ProductImage, FragranceNote


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />')
        return "-"
    image_preview.short_description = 'Preview'


class FragranceNoteInline(admin.TabularInline):
    model = FragranceNote
    extra = 3


class ProductAdmin(admin.ModelAdmin):
    list_display  = ['image_preview', 'name', 'category', 'scent_note', 'top_notes', 'heart_notes', 'base_notes', 'is_featured', 'is_bestseller', 'is_active']
    list_display_links = ['image_preview', 'name']
    prepopulated_fields = {'slug': ('name',)}
    inlines       = [ProductVariantInline, ProductImageInline, FragranceNoteInline]
    list_filter   = ['category', 'scent_note', 'is_featured', 'is_bestseller', 'is_active']
    search_fields = ['name', 'top_notes', 'heart_notes', 'base_notes']

    def image_preview(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if image and image.image:
            return mark_safe(f'<img src="{image.image.url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />')
        return "🧴"
    image_preview.short_description = 'Image'


class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'product', 'is_primary', 'alt_text']
    list_filter = ['is_primary', 'product']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />')
        return "-"
    image_preview.short_description = 'Preview'


class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}


admin.site.register(Category, CategoryAdmin)
admin.site.register(ScentNote)
admin.site.register(Product, ProductAdmin)
admin.site.register(FragranceNote)
admin.site.register(ProductVariant)
admin.site.register(ProductImage, ProductImageAdmin)