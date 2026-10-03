import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAddresses, addAddress } from '../api/auth'
import { placeOrder } from '../api/orders'
import { applyCoupon } from '../api/orders'
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payments'
import { ShieldCheck, Truck, Plus, AlertCircle } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { getProductImage } from '../utils/imageUtils'
import { loadRazorpayScript } from '../utils/razorpay'
import toast from 'react-hot-toast'

function CheckoutPage() {
  const [step,           setStep]           = useState(1)
  const [addresses,      setAddresses]      = useState([])
  const [selectedAddr,   setSelectedAddr]   = useState(null)
  const [paymentMethod,  setPaymentMethod]  = useState('online')
  const [couponCode,     setCouponCode]     = useState('')
  const [discount,       setDiscount]       = useState(0)
  const [couponApplied,  setCouponApplied]  = useState(false)
  const [placing,        setPlacing]        = useState(false)
  const [addingAddress,  setAddingAddress]  = useState(false)

  const [formErrors, setFormErrors] = useState({})
  const [newAddr, setNewAddr] = useState({
    full_name: '', phone: '', address_line: '',
    city: '', state: '', pincode: '', is_default: false,
  })

  const { cart, fetchCart, clearCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
    loadAddresses()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const loadAddresses = async () => {
    try {
      const res = await getAddresses()
      setAddresses(res.data)
      const def = res.data.find((a) => a.is_default)
      if (def) setSelectedAddr(def.id)
      else if (res.data.length > 0) setSelectedAddr(res.data[0].id)
    } catch {
      toast.error('Failed to load addresses')
    }
  }

  const validateAddressForm = () => {
    const errors = {}
    const nameRegex = /^[A-Za-z\s.'-]{2,100}$/
    if (!newAddr.full_name.trim()) errors.full_name = 'Full name is required.'
    else if (!nameRegex.test(newAddr.full_name.trim())) errors.full_name = 'Only letters and spaces are allowed.'

    const phoneDigits = newAddr.phone.replace(/\D/g, '')
    if (!phoneDigits) errors.phone = 'Phone number is required.'
    else if (phoneDigits.length !== 10) errors.phone = 'Enter a valid 10-digit mobile number.'

    if (!newAddr.address_line.trim()) errors.address_line = 'House/Flat, Street & Area required.'
    else if (newAddr.address_line.trim().length < 5) errors.address_line = 'Address must be at least 5 characters.'

    if (!newAddr.city.trim()) errors.city = 'City name is required.'
    if (!newAddr.state.trim()) errors.state = 'State name is required.'

    const pinDigits = newAddr.pincode.replace(/\D/g, '')
    if (!pinDigits) errors.pincode = 'PIN code is required.'
    else if (pinDigits.length !== 6) errors.pincode = 'PIN code must be exactly 6 digits.'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!validateAddressForm()) {
      toast.error('Please resolve the address errors before saving.')
      return
    }

    try {
      const res = await addAddress({
        ...newAddr,
        phone: newAddr.phone.replace(/\D/g, ''),
        pincode: newAddr.pincode.replace(/\D/g, ''),
      })
      toast.success('Address saved successfully!')
      setAddingAddress(false)
      setNewAddr({
        full_name: '', phone: '', address_line: '',
        city: '', state: '', pincode: '', is_default: false,
      })
      setFormErrors({})
      await loadAddresses()
      setSelectedAddr(res.data.id)
    } catch {
      toast.error('Failed to add address')
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    try {
      const res = await applyCoupon(couponCode, totalPrice)
      setDiscount(res.data.discount_amount)
      setCouponApplied(true)
      toast.success(`Coupon "${couponCode.toUpperCase()}" applied!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddr) {
      toast.error('Please select or add a delivery address')
      setStep(1)
      return
    }

    setPlacing(true)

    try {
      if (paymentMethod === 'cod') {
        const res = await placeOrder({
          address_id:     selectedAddr,
          payment_method: 'cod',
          coupon_code:    couponApplied ? couponCode : '',
        })
        clearCart()
        toast.success('Order placed successfully!')
        navigate(`/orders/${res.data.id}`)
      } else {
        const orderRes = await placeOrder({
          address_id:     selectedAddr,
          payment_method: 'online',
          coupon_code:    couponApplied ? couponCode : '',
        })

        const orderId = orderRes.data.id

        try {
          const rzpRes = await createRazorpayOrder(orderId)
          const { razorpay_order_id, amount, currency, key } = rzpRes.data

          const options = {
            key,
            amount,
            currency,
            name:        'RyOx Maison De Parfum',
            description: `Order #${orderId}`,
            order_id:    razorpay_order_id,
            handler: async (response) => {
              try {
                await verifyRazorpayPayment({
                  order_id:              orderId,
                  razorpay_payment_id:   response.razorpay_payment_id,
                  razorpay_order_id:     response.razorpay_order_id,
                  razorpay_signature:    response.razorpay_signature,
                })
                clearCart()
                toast.success('Payment confirmed! Your order is secured.')
                navigate(`/orders/${orderId}`)
              } catch {
                toast.error('Payment verification failed. Please contact support.')
                navigate(`/orders/${orderId}`)
              }
            },
            theme: { color: '#bfa15f' },
          }

          const isLoaded = await loadRazorpayScript()
          if (isLoaded && window.Razorpay) {
            const rzp = new window.Razorpay(options)
            rzp.open()
          } else {
            toast.success('Order placed! Redirecting to tracking...')
            clearCart()
            navigate(`/orders/${orderId}`)
          }
        } catch {
          clearCart()
          toast.success('Order registered!')
          navigate(`/orders/${orderId}`)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    }

    setPlacing(false)
  }

  const totalPrice = parseFloat(cart?.total_price || 0)
  const delivery   = totalPrice > 999 ? 0 : (totalPrice > 0 ? 99 : 0)
  const finalTotal = Math.max(0, totalPrice - discount + delivery).toFixed(2)

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Secure Checkout</h1>

      {/* Progress Steps */}
      <div style={styles.steps}>
        {[
          { num: 1, label: 'Shipping Address' },
          { num: 2, label: 'Payment Method' },
          { num: 3, label: 'Review & Confirm' },
        ].map((s) => (
          <div key={s.num} style={styles.stepWrap}>
            <div style={{
              ...styles.stepCircle,
              backgroundColor: step >= s.num ? '#bfa15f' : '#e5dfd5',
              color: step >= s.num ? '#14120e' : '#8c847a',
            }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{
              ...styles.stepLabel,
              color: step >= s.num ? 'var(--ryox-text-heading)' : 'var(--ryox-text-muted)',
            }}>
              {s.label}
            </span>
            {s.num < 3 && <div style={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div style={styles.layout}>
        <div style={styles.main}>
          {/* STEP 1 — Shipping Address */}
          {step === 1 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Select Delivery Address</h2>

              {addresses.length === 0 && !addingAddress && (
                <p style={styles.noAddr}>No addresses saved yet. Please add one below.</p>
              )}

              {/* Address Selection List */}
              <div style={styles.addrList}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      ...styles.addrCard,
                      border: selectedAddr === addr.id ? '2px solid #bfa15f' : '1px solid var(--ryox-divider)',
                      backgroundColor: selectedAddr === addr.id ? 'rgba(191,161,95,0.06)' : 'var(--ryox-surface-subtle)',
                    }}
                    onClick={() => setSelectedAddr(addr.id)}
                  >
                    <div style={styles.addrRadio}>
                      <div style={{
                        ...styles.radio,
                        backgroundColor: selectedAddr === addr.id ? '#bfa15f' : 'transparent',
                        border: selectedAddr === addr.id ? '2px solid #bfa15f' : '2px solid #ccc',
                      }} />
                    </div>
                    <div>
                      <p style={styles.addrName}>{addr.full_name}</p>
                      <p style={styles.addrText}>{addr.address_line}</p>
                      <p style={styles.addrText}>{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p style={styles.addrText}>📞 +91 {addr.phone}</p>
                      {addr.is_default && <span style={styles.defaultBadge}>Default Address</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address Form */}
              {addingAddress ? (
                <form onSubmit={handleAddAddress} style={styles.addrForm}>
                  <h3 style={styles.formTitle}>Add New Shipping Address</h3>

                  <div style={styles.formGrid}>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Full Name *</label>
                      <input
                        type="text"
                        placeholder="Recipient full name"
                        value={newAddr.full_name}
                        onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.full_name ? '#ef5350' : 'var(--ryox-divider)',
                        }}
                      />
                      {formErrors.full_name && (
                        <span style={styles.errorMsg}><AlertCircle size={12} /> {formErrors.full_name}</span>
                      )}
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Mobile Number *</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile"
                        maxLength={10}
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.phone ? '#ef5350' : 'var(--ryox-divider)',
                        }}
                      />
                      {formErrors.phone && (
                        <span style={styles.errorMsg}><AlertCircle size={12} /> {formErrors.phone}</span>
                      )}
                    </div>

                    <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                      <label style={styles.formLabel}>Flat, House No., Building, Street *</label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 402, Royal Gardens, MG Road"
                        value={newAddr.address_line}
                        onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.address_line ? '#ef5350' : 'var(--ryox-divider)',
                        }}
                      />
                      {formErrors.address_line && (
                        <span style={styles.errorMsg}><AlertCircle size={12} /> {formErrors.address_line}</span>
                      )}
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>City *</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.city ? '#ef5350' : 'var(--ryox-divider)',
                        }}
                      />
                      {formErrors.city && (
                        <span style={styles.errorMsg}><AlertCircle size={12} /> {formErrors.city}</span>
                      )}
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>State *</label>
                      <input
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.state ? '#ef5350' : 'var(--ryox-divider)',
                        }}
                      />
                      {formErrors.state && (
                        <span style={styles.errorMsg}><AlertCircle size={12} /> {formErrors.state}</span>
                      )}
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>6-Digit PIN Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. 400001"
                        maxLength={6}
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.pincode ? '#ef5350' : 'var(--ryox-divider)',
                        }}
                      />
                      {formErrors.pincode && (
                        <span style={styles.errorMsg}><AlertCircle size={12} /> {formErrors.pincode}</span>
                      )}
                    </div>
                  </div>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newAddr.is_default}
                      onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                    />
                    <span style={{ color: 'var(--ryox-text-muted)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>Save as primary default address</span>
                  </label>

                  <div style={styles.formBtns}>
                    <button type="submit" style={styles.saveBtn}>Validate & Save Address</button>
                    <button type="button" style={styles.cancelBtn} onClick={() => { setAddingAddress(false); setFormErrors({}); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button style={styles.addAddrBtn} onClick={() => setAddingAddress(true)}>
                  <Plus size={16} /> Add New Shipping Address
                </button>
              )}

              <button
                style={selectedAddr ? styles.nextBtn : styles.nextBtnDisabled}
                onClick={() => selectedAddr && setStep(2)}
                disabled={!selectedAddr}
              >
                Proceed to Payment Method →
              </button>
            </div>
          )}

          {/* STEP 2 — Payment & Coupon */}
          {step === 2 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Payment Gateway & Offers</h2>

              <div style={styles.paymentOptions}>
                {[
                  { value: 'online', label: '💳 Instant Online Payment (Razorpay)', desc: 'UPI, Credit/Debit Cards, NetBanking with 256-bit encryption.' },
                  { value: 'cod', label: '💵 Cash on Delivery (COD)', desc: 'Pay with cash upon delivery to your doorstep.' },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    style={{
                      ...styles.paymentCard,
                      border: paymentMethod === opt.value ? '2px solid #bfa15f' : '1px solid var(--ryox-divider)',
                      backgroundColor: paymentMethod === opt.value ? 'rgba(191,161,95,0.06)' : '#ffffff',
                    }}
                    onClick={() => setPaymentMethod(opt.value)}
                  >
                    <div style={{
                      ...styles.radio,
                      backgroundColor: paymentMethod === opt.value ? '#bfa15f' : 'transparent',
                      border: paymentMethod === opt.value ? '2px solid #bfa15f' : '2px solid #ccc',
                      marginRight: '1rem',
                      flexShrink: 0,
                    }} />
                    <div>
                      <p style={styles.paymentLabel}>{opt.label}</p>
                      <p style={styles.paymentDesc}>{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Redemption */}
              <div style={styles.couponSection}>
                <h3 style={styles.couponTitle}>Apply Promotional Code</h3>
                <div style={styles.couponRow}>
                  <input
                    type="text"
                    placeholder="e.g. RYOX10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                    style={styles.couponInput}
                  />
                  <button
                    style={couponApplied ? styles.couponBtnApplied : styles.couponBtn}
                    onClick={handleApplyCoupon}
                    disabled={couponApplied}
                  >
                    {couponApplied ? '✓ Applied' : 'Apply Coupon'}
                  </button>
                </div>
                {couponApplied && (
                  <p style={styles.couponSaved}>
                    ✨ Promotional discount applied! You saved ₹{discount.toFixed(2)}
                  </p>
                )}
              </div>

              <div style={styles.stepBtns}>
                <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button style={styles.nextBtn} onClick={() => setStep(3)}>Review Final Order →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Final Review with Product Images */}
          {step === 3 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Review Order Summary</h2>

              {/* Purchased Items with Image Thumbnails */}
              <div style={styles.reviewItems}>
                {cart?.items?.map((item) => {
                  const itemImg = getProductImage(item.product) || getProductImage(item.variant?.product)
                  return (
                    <div key={item.id} style={styles.reviewItem}>
                      <div style={styles.reviewImgWrap}>
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.product?.name || 'Fragrance'}
                            style={styles.reviewImg}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <span style={styles.fallbackEmoji}>🧴</span>
                        )}
                      </div>
                      <div style={styles.reviewItemInfo}>
                        <p style={styles.reviewItemName}>{item.product?.name}</p>
                        <p style={styles.reviewItemSize}>Volume: {item.variant?.size_ml}ml · Qty: {item.quantity}</p>
                      </div>
                      <p style={styles.reviewItemPrice}>₹{item.subtotal}</p>
                    </div>
                  )
                })}
              </div>

              {/* Selected Verified Address */}
              {addresses.find((a) => a.id === selectedAddr) && (
                <div style={styles.reviewSection}>
                  <p style={styles.reviewSectionTitle}>Shipping To:</p>
                  <p style={styles.reviewText}>
                    <strong>{addresses.find((a) => a.id === selectedAddr)?.full_name}</strong><br />
                    {addresses.find((a) => a.id === selectedAddr)?.address_line}<br />
                    {addresses.find((a) => a.id === selectedAddr)?.city}, {addresses.find((a) => a.id === selectedAddr)?.state} — {addresses.find((a) => a.id === selectedAddr)?.pincode}<br />
                    📞 +91 {addresses.find((a) => a.id === selectedAddr)?.phone}
                  </p>
                </div>
              )}

              <div style={styles.reviewSection}>
                <p style={styles.reviewSectionTitle}>Selected Payment:</p>
                <p style={styles.reviewText}>
                  {paymentMethod === 'cod' ? '💵 Cash on Delivery (COD)' : '💳 Razorpay Secured Online Payment'}
                </p>
              </div>

              <div style={styles.stepBtns}>
                <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
                <button
                  style={placing ? styles.nextBtnDisabled : styles.placeBtn}
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? 'Securing & Placing Order...' : '🎉 Confirm & Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown Sidebar with Item Images */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Cart Breakdown</h2>
          <div style={styles.summaryItemsList}>
            {cart?.items?.map((item) => {
              const itemImg = getProductImage(item.product) || getProductImage(item.variant?.product)
              return (
                <div key={item.id} style={styles.summaryItem}>
                  <div style={styles.summaryImgWrap}>
                    {itemImg ? (
                      <img
                        src={itemImg}
                        alt={item.product?.name || 'Fragrance'}
                        style={styles.summaryImg}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '1rem' }}>🧴</span>
                    )}
                  </div>
                  <div style={styles.summaryItemInfo}>
                    <span style={styles.summaryItemName}>
                      {item.product?.name}
                    </span>
                    <span style={styles.summaryItemQty}>Qty: {item.quantity}</span>
                  </div>
                  <span style={styles.summaryItemPrice}>₹{item.subtotal}</span>
                </div>
              )
            })}
          </div>

          <div style={styles.divider} />

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal</span>
            <span style={styles.summaryValue}>₹{totalPrice}</span>
          </div>

          {discount > 0 && (
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Coupon Discount</span>
              <span style={{ ...styles.summaryValue, color: '#2e7d32' }}>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Delivery Fee</span>
            <span style={{ ...styles.summaryValue, color: delivery === 0 ? '#2e7d32' : 'var(--ryox-text-heading)' }}>
              {delivery === 0 ? 'FREE' : `₹${delivery}`}
            </span>
          </div>

          <div style={styles.divider} />

          <div style={styles.summaryRow}>
            <span style={styles.totalLabel}>Total Payable</span>
            <span style={styles.totalValue}>₹{finalTotal}</span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> 256-Bit SSL Encrypted Checkout
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ryox-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Truck size={14} /> Delivered in 4-6 Business Days
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: 'var(--ryox-bg)', minHeight: '100vh', padding: '3rem 2rem 5rem', maxWidth: '1280px', margin: '0 auto', color: 'var(--ryox-text)' },
  pageTitle: { fontFamily: 'var(--ryox-font-serif)', color: 'var(--ryox-text-heading)', fontSize: '2.4rem', fontWeight: '500', marginBottom: '2rem' },

  steps: { display: 'flex', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '0.5rem' },
  stepWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  stepCircle: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: '700',
  },
  stepLabel: { fontSize: '0.85rem', fontWeight: '600' },
  stepLine: { width: '40px', height: '1px', backgroundColor: 'var(--ryox-divider)', margin: '0 0.5rem' },

  layout: { display: 'flex', gap: '2.5rem', flexWrap: 'wrap' },
  main: { flex: 2, minWidth: '320px' },

  card: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '2rem', marginBottom: '1rem', boxShadow: 'var(--ryox-shadow-sm)' },
  cardTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },

  noAddr: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' },

  addrList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' },
  addrCard: {
    borderRadius: '12px', padding: '1.2rem', cursor: 'pointer',
    display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'all 0.3s ease',
  },
  addrRadio: { paddingTop: '0.2rem' },
  radio: { width: '16px', height: '16px', borderRadius: '50%' },
  addrName: { color: 'var(--ryox-text-heading)', fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.98rem' },
  addrText: { color: 'var(--ryox-text-muted)', fontSize: '0.88rem', marginBottom: '0.2rem' },
  defaultBadge: { backgroundColor: 'rgba(46,125,50,0.1)', color: '#2e7d32', border: '1px solid rgba(46,125,50,0.25)', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', marginTop: '0.4rem', display: 'inline-block', fontWeight: '700' },

  addrForm: { backgroundColor: 'var(--ryox-surface-subtle)', border: '1px solid var(--ryox-divider)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle: { color: 'var(--ryox-text-heading)', fontSize: '1.05rem', fontWeight: '600', marginBottom: '1.2rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  formField: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  formLabel: { color: 'var(--ryox-text-muted)', fontSize: '0.8rem', fontWeight: '600' },
  formInput: { padding: '0.75rem 0.9rem', backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '8px', color: 'var(--ryox-text-heading)', fontSize: '0.9rem', outline: 'none' },
  errorMsg: { color: '#ef5350', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', marginBottom: '1.2rem', cursor: 'pointer' },
  formBtns: { display: 'flex', gap: '0.8rem' },
  saveBtn: { padding: '0.8rem 1.6rem', background: 'var(--ryox-gold-gradient)', color: '#14120e', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' },
  cancelBtn: { padding: '0.8rem 1.6rem', backgroundColor: 'transparent', color: 'var(--ryox-text-muted)', border: '1px solid var(--ryox-divider)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },

  addAddrBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    backgroundColor: 'transparent', border: '1px dashed rgba(191,161,95,0.6)',
    color: 'var(--ryox-gold-dark)', padding: '0.9rem 1.2rem', borderRadius: '10px',
    cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', width: '100%',
    justifyContent: 'center', fontWeight: '700',
  },

  nextBtn: {
    width: '100%', padding: '1.1rem', background: 'var(--ryox-gold-gradient)',
    color: '#14120e', border: 'none', borderRadius: '10px',
    fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', marginTop: '1rem',
    letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 8px 25px rgba(191,161,95,0.35)',
  },
  nextBtnDisabled: {
    width: '100%', padding: '1.1rem', backgroundColor: '#e5dfd5',
    color: '#a39b90', border: 'none', borderRadius: '10px',
    fontSize: '0.88rem', fontWeight: '700', cursor: 'not-allowed', marginTop: '1rem',
    letterSpacing: '1px', textTransform: 'uppercase',
  },
  placeBtn: {
    flex: 1, padding: '1.1rem', background: 'var(--ryox-gold-gradient)',
    color: '#14120e', border: 'none', borderRadius: '10px',
    fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
    boxShadow: '0 8px 25px rgba(191,161,95,0.35)',
  },
  stepBtns: { display: 'flex', gap: '1rem', marginTop: '1.8rem' },
  backBtn: {
    padding: '1.1rem 1.8rem', backgroundColor: 'transparent',
    color: 'var(--ryox-text-muted)', border: '1px solid var(--ryox-divider)', borderRadius: '10px',
    cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600',
  },

  paymentOptions: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' },
  paymentCard: { borderRadius: '12px', padding: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  paymentLabel: { color: 'var(--ryox-text-heading)', fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.95rem' },
  paymentDesc: { color: 'var(--ryox-text-muted)', fontSize: '0.85rem' },

  couponSection: { borderTop: '1px solid var(--ryox-divider)', paddingTop: '1.4rem' },
  couponTitle: { color: 'var(--ryox-text-heading)', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.8rem' },
  couponRow: { display: 'flex', gap: '0.8rem' },
  couponInput: {
    flex: 1, padding: '0.75rem 1rem', backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)', borderRadius: '8px', color: 'var(--ryox-text-heading)',
    fontSize: '0.9rem', outline: 'none', letterSpacing: '2px',
  },
  couponBtn: {
    padding: '0.75rem 1.5rem', background: 'var(--ryox-gold-gradient)',
    color: '#14120e', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase',
  },
  couponBtnApplied: {
    padding: '0.75rem 1.5rem', backgroundColor: 'rgba(46,125,50,0.12)',
    color: '#2e7d32', border: '1px solid rgba(46,125,50,0.25)', borderRadius: '8px',
    cursor: 'not-allowed', fontWeight: '700', fontSize: '0.82rem',
  },
  couponSaved: { color: '#2e7d32', fontSize: '0.85rem', marginTop: '0.6rem', fontWeight: '600' },

  reviewItems: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' },
  reviewItem: { display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--ryox-divider)' },
  reviewImgWrap: {
    width: '48px', height: '48px', borderRadius: '8px',
    backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  reviewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  fallbackEmoji: { fontSize: '1.3rem' },
  reviewItemInfo: { flex: 1 },
  reviewItemName: { color: 'var(--ryox-text-heading)', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.2rem' },
  reviewItemSize: { color: 'var(--ryox-text-muted)', fontSize: '0.82rem', margin: 0 },
  reviewItemPrice: { color: 'var(--ryox-text-heading)', fontSize: '0.95rem', fontWeight: '700' },

  reviewSection: { borderTop: '1px solid var(--ryox-divider)', paddingTop: '1rem', marginTop: '1rem' },
  reviewSectionTitle: { color: 'var(--ryox-gold-dark)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' },
  reviewText: { color: 'var(--ryox-text)', fontSize: '0.9rem', lineHeight: 1.6 },

  summary: {
    flex: 1, minWidth: '300px', backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)', borderRadius: '16px',
    padding: '2rem', height: 'fit-content', position: 'sticky', top: '100px',
    boxShadow: 'var(--ryox-shadow-md)',
  },
  summaryTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--ryox-divider)' },
  summaryItemsList: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '0.5rem' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  summaryImgWrap: {
    width: '38px', height: '38px', borderRadius: '6px',
    backgroundColor: 'var(--ryox-surface-subtle)', border: '1px solid var(--ryox-divider)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  summaryImg: { width: '100%', height: '100%', objectFit: 'cover' },
  summaryItemInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  summaryItemName: { color: 'var(--ryox-text-heading)', fontSize: '0.85rem', fontWeight: '600' },
  summaryItemQty: { color: 'var(--ryox-text-muted)', fontSize: '0.75rem' },
  summaryItemPrice: { color: 'var(--ryox-text-heading)', fontSize: '0.85rem', fontWeight: '600' },

  divider: { borderTop: '1px solid var(--ryox-divider)', margin: '1.2rem 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' },
  summaryLabel: { color: 'var(--ryox-text-muted)', fontSize: '0.88rem' },
  summaryValue: { color: 'var(--ryox-text-heading)', fontSize: '0.9rem', fontWeight: '600' },
  totalLabel: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.1rem', fontWeight: '700' },
  totalValue: { color: 'var(--ryox-text-heading)', fontSize: '1.4rem', fontWeight: '700' },
}

export default CheckoutPage