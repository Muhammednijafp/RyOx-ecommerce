from django.urls import path

from .views import (
    MyReferralView,
    MyReferralListView,
)


urlpatterns = [
    path(
        "my/",
        MyReferralView.as_view(),
        name="my-referral"
    ),

    path(
        "my/list/",
        MyReferralListView.as_view(),
        name="my-referral-list"
    ),
]