from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, PlaceOrderSerializer


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=400)


class OrderListView(generics.ListAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items__variant__product').order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items__variant__product')


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel order in {order.status} status'},
                status=400
            )

        # restore stock
        for item in order.items.all():
            item.variant.stock += item.quantity
            item.variant.save()

        order.status = 'cancelled'
        order.save()

        from notifications.models import Notification
        Notification.objects.create(
            user    = request.user,
            type    = 'order',
            title   = 'Order Cancelled',
            message = f'Your order #{order.id} has been cancelled.',
        )

        return Response({'message': 'Order cancelled successfully'})