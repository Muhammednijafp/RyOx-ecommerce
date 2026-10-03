from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Coupon
from .serializers import CouponApplySerializer


class ApplyCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponApplySerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            coupon     = serializer.validated_data['coupon']
            discount   = serializer.validated_data['discount']
            final      = serializer.validated_data['final_total']
            return Response({
                'code':         coupon.code,
                'discount_type': coupon.discount_type,
                'discount':     str(discount),
                'final_total':  str(final),
                'message':      f'Coupon applied! You save ₹{discount}',
            })
        return Response(serializer.errors, status=400)


class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        try:
            coupon = Coupon.objects.get(code=code.upper())
            if coupon.is_valid():
                return Response({
                    'valid':          True,
                    'discount_type':  coupon.discount_type,
                    'discount_value': str(coupon.discount_value),
                    'min_order':      str(coupon.min_order_value),
                })
            return Response({'valid': False, 'message': 'Coupon expired or inactive'})
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Coupon not found'}, status=404)