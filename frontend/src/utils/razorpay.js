import { createRazorpayOrder, verifyPayment, recordFailure } from '../api/payments'

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initiateRazorpayPayment = async ({ orderId, onSuccess, onFailure }) => {
  try {
    // create razorpay order from backend
    const res  = await createRazorpayOrder({ order_id: orderId })
    const data = res.data

    const options = {
      key:         data.key,
      amount:      data.amount,
      currency:    data.currency,
      name:        data.name,
      description: data.description,
      order_id:    data.razorpay_order_id,
      prefill: {
        name:    data.prefill.name,
        email:   data.prefill.email,
        contact: data.prefill.phone,
      },
      theme: {
        color: '#c9a84c',
      },
      handler: async (response) => {
        // payment success — verify with backend
        try {
          await verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            order_id:            orderId,
          })
          onSuccess(orderId)
        } catch {
          onFailure('Payment verification failed')
        }
      },
      modal: {
        ondismiss: async () => {
          // user closed the payment modal
          await recordFailure({ razorpay_order_id: data.razorpay_order_id })
          onFailure('Payment cancelled')
        }
      }
    }

    // open razorpay checkout
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', async (response) => {
      await recordFailure({ razorpay_order_id: data.razorpay_order_id })
      onFailure(response.error.description)
    })
    rzp.open()

  } catch (err) {
    onFailure(err.response?.data?.error || 'Failed to initiate payment')
  }
}