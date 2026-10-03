from django.db import models


class Category(models.Model):
    GENDER_CHOICES = [
        ('him', 'Him'),
        ('her', 'Her'),
        ('unisex', 'Unisex'),
        ('gifting', 'Gifting'),
    ]
    name        = models.CharField(max_length=100)
    gender      = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    slug        = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class ScentNote(models.Model):
    NOTE_CHOICES = [
        ('fruity', 'Fruity'),
        ('woody', 'Woody'),
        ('floral', 'Floral'),
        ('aquatic', 'Aquatic'),
        ('spicy', 'Spicy'),
        ('oudhy', 'Oudhy'),
        ('citrus', 'Citrus'),
        ('musky', 'Musky'),
        ('oriental', 'Oriental'),
        ('fresh', 'Fresh'),
    ]
    name = models.CharField(max_length=50, choices=NOTE_CHOICES, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name          = models.CharField(max_length=200)
    slug          = models.SlugField(unique=True)
    category      = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    scent_note    = models.ForeignKey(ScentNote, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description   = models.TextField(blank=True)
    
    # Perfume Scent Notes
    top_notes     = models.CharField(max_length=255, blank=True, help_text="e.g. Bergamot, Pink Pepper, Grapefruit")
    heart_notes   = models.CharField(max_length=255, blank=True, help_text="e.g. Damask Rose, Jasmine Sambac, Lavender")
    base_notes    = models.CharField(max_length=255, blank=True, help_text="e.g. Royal Amberwood, Bourbon Vanilla, Cedarwood")

    is_featured   = models.BooleanField(default=False)
    is_active     = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class FragranceNote(models.Model):
    NOTE_TYPES = [
        ('top', 'Top Note'),
        ('heart', 'Heart Note'),
        ('base', 'Base Note'),
    ]
    product   = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='fragrance_notes')
    note_type = models.CharField(max_length=10, choices=NOTE_TYPES, default='top')
    name      = models.CharField(max_length=100, help_text="Note name e.g. Bergamot")

    def __str__(self):
        return f"{self.product.name} - {self.get_note_type_display()}: {self.name}"


class ProductVariant(models.Model):
    product       = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size_ml       = models.PositiveIntegerField()  # e.g. 50, 75, 90, 14
    mrp           = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock         = models.PositiveIntegerField(default=0)
    is_available  = models.BooleanField(default=True)

    def discount_percent(self):
        if self.mrp > self.selling_price:
            return round((self.mrp - self.selling_price) / self.mrp * 100)
        return 0

    def __str__(self):
        return f"{self.product.name} - {self.size_ml}ml"


class ProductImage(models.Model):
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image      = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    alt_text   = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.product.name} image"