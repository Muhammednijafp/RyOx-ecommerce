from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Referral
from .serializers import ReferralSerializer


class MyReferralView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        referral, created = Referral.objects.get_or_create(
            referrer=request.user
        )

        serializer = ReferralSerializer(referral)

        return Response(serializer.data)


class MyReferralListView(generics.ListAPIView):
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Referral.objects.filter(
            referrer=self.request.user
        ).select_related(
            "referrer",
            "referred_user"
        )