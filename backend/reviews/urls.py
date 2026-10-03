from django.urls import path
from .views import ProductReviewListView, ReviewCreateView, ReviewDeleteView

urlpatterns = [
    path('product/<int:product_id>/', ProductReviewListView.as_view(), name='product-reviews'),
    path('create/',                   ReviewCreateView.as_view(),      name='review-create'),
    path('<int:pk>/delete/',          ReviewDeleteView.as_view(),      name='review-delete'),
]