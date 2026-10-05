import razorpay
import hmac
import hashlib
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from orders.models import Order
from notifications.models import Notification
from .models import Payment

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        if order.is_paid:
            return Response({'error': 'Order already paid'}, status=400)

        # amount in paise (multiply by 100)
        amount_paise = int(order.final_amount * 100)

        # create razorpay order
        razorpay_order = client.order.create({
            'amount':   amount_paise,
            'currency': 'INR',
            'receipt':  f'order_{order.id}',
            'notes': {
                'order_id': str(order.id),
                'user':     request.user.email,
            }
        })

        # save payment record
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'user':              request.user,
                'razorpay_order_id': razorpay_order['id'],
                'amount':            order.final_amount,
            }
        )
        if not created:
            payment.razorpay_order_id = razorpay_order['id']
            payment.amount = order.final_amount
            payment.save()

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount':            amount_paise,
            'currency':          'INR',
            'key':               settings.RAZORPAY_KEY_ID,
            'order_id':          order.id,
            'name':              'RyOx',
            'description':       f'Order #{order.id}',
            'prefill': {
                'email': request.user.email,
                'name':  request.user.full_name,
                'phone': request.user.phone,
            }
        })


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id   = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature  = request.data.get('razorpay_signature')
        order_id            = request.data.get('order_id')

        # verify signature
        body        = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected    = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected != razorpay_signature:
            return Response({'error': 'Invalid payment signature'}, status=400)

        # update payment record
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature  = razorpay_signature
            payment.status              = 'success'
            payment.save()

            # mark order as paid
            order         = payment.order
            order.is_paid = True
            order.status  = 'confirmed'
            order.save()

            # send notification
            Notification.objects.create(
                user    = request.user,
                type    = 'order',
                title   = 'Payment Successful!',
                message = f'Payment for Order #{order.id} of ₹{order.final_amount} confirmed.',
            )

            return Response({'message': 'Payment verified successfully', 'order_id': order.id})

        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found'}, status=404)


class PaymentFailedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        try:
            payment        = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.status = 'failed'
            payment.save()
            return Response({'message': 'Payment failure recorded'})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=404)