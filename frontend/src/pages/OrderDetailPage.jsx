import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder, cancelOrder } from '../api/orders'
import { ChevronLeft, Truck, Package, Clock, ShieldCheck, MapPin, CheckCircle2, AlertTriangle, ExternalLink, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProductImage } from '../utils/imageUtils'

function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrder(id)
        setOrder(res.data)
      } catch {
        toast.error('Order not found')
      }
      setLoading(false)
    }
    fetchOrder()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await cancelOrder(id)
      toast.success('Order cancelled successfully')
      const res = await getOrder(id)
      setOrder(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel order')
    }
    setCancelling(false)
  }

  const statusColor = (status) => {
    const colors = {
      pending:    '#d97706',
      confirmed:  '#2563eb',
      processing: '#7c3aed',
      shipped:    '#0284c7',
      delivered:  '#16a34a',
      cancelled:  '#dc2626',
      returned:   '#ea580c',
    }
    return colors[status] || '#6b7280'
  }

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <Package size={36} color="var(--ryox-gold-dark)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--ryox-gold-dark)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
            Fetching Order Details...
          </p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.loadingBox, padding: '8rem 0' }}>
          <h2 style={{ fontFamily: 'var(--ryox-font-serif)', color: 'var(--ryox-text-heading)', fontSize: '1.8rem', marginBottom: '1rem' }}>Order Not Found</h2>
          <Link to="/orders" style={styles.shopBtn}>View All Orders</Link>
        </div>
      </div>
    )
  }

  const currentStep = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'returned'

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Back Link */}
        <Link to="/orders" style={styles.backLink}>
          <ChevronLeft size={16} /> Back to Order History
        </Link>

        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.headerSubtitle}>ORDER CONFIRMATION</span>
            <h1 style={styles.title}>Order #{order.id}</h1>
            <p style={styles.date}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          <div style={styles.headerBadgeWrap}>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: statusColor(order.status) + '18',
              color: statusColor(order.status),
              border: `1px solid ${statusColor(order.status)}40`,
            }}>
              ● {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Live Order Tracking Timeline */}
        {!isCancelled && (
          <div style={styles.trackerCard}>
            <div style={styles.trackerHeader}>
              <h3 style={styles.trackerTitle}>
                <Truck size={18} color="var(--ryox-gold-dark)" /> Shipment & Progress Tracker
              </h3>
              {order.tracking_number && (
                <button style={styles.liveTrackBtn} onClick={() => setTrackingModalOpen(true)}>
                  <ExternalLink size={14} /> Live Tracking Status
                </button>
              )}
            </div>

            <div style={styles.trackerBar}>
              {statusSteps.map((step, i) => (
                <div key={step} style={styles.trackStep}>
                  <div style={{
                    ...styles.trackDot,
                    backgroundColor: i <= currentStep ? '#bfa15f' : '#f0ece3',
                    border: i <= currentStep ? '2px solid #bfa15f' : '2px solid #ddd',
                    color: i <= currentStep ? '#14120e' : '#8c847a',
                  }}>
                    {i <= currentStep ? '✓' : i + 1}
                  </div>
                  <p style={{
                    ...styles.trackLabel,
                    color: i <= currentStep ? 'var(--ryox-gold-dark)' : 'var(--ryox-text-muted)',
                    fontWeight: i === currentStep ? '700' : '500',
                  }}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </p>
                  {i < statusSteps.length - 1 && (
                    <div style={{
                      ...styles.trackLine,
                      backgroundColor: i < currentStep ? '#bfa15f' : 'var(--ryox-divider)',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Courier & AWB Details Box */}
            <div style={styles.logisticsBox}>
              <div style={styles.logisticsItem}>
                <span style={styles.logisticsLabel}>Tracking Number (AWB):</span>
                <span style={styles.logisticsValue}>{order.tracking_number || `RYX-${order.id}9283-IN`}</span>
              </div>
              <div style={styles.logisticsItem}>
                <span style={styles.logisticsLabel}>Courier Partner:</span>
                <span style={styles.logisticsValue}>{order.courier_partner || 'RyOx Express / Delhivery'}</span>
              </div>
              <div style={styles.logisticsItem}>
                <span style={styles.logisticsLabel}>Estimated Delivery:</span>
                <span style={{ ...styles.logisticsValue, color: '#16a34a' }}>
                  {order.estimated_delivery
                    ? new Date(order.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Within 4-6 Business Days'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={styles.layout}>
          <div style={styles.main}>

            {/* Purchased Items List */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Purchased Fragrances ({order.items?.length || 0})</h2>
              <div style={styles.itemsList}>
                {order.items?.map((item) => {
                  const imageUrl = getProductImage(item.product) || getProductImage(item.variant?.product)
                  return (
                    <div key={item.id} style={styles.itemRow}>
                      <Link to={`/product/${item.product?.slug}`} style={styles.itemImgWrap}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product?.name}
                            style={styles.itemImg}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              const fb = e.target.parentElement.querySelector('.item-fb')
                              if (fb) fb.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className="item-fb" style={{ ...styles.itemImgPlaceholder, display: imageUrl ? 'none' : 'flex' }}>
                          🧴
                        </div>
                      </Link>

                      <div style={styles.itemDetails}>
                        <Link to={`/product/${item.product?.slug}`} style={styles.itemName}>
                          {item.product?.name}
                        </Link>
                        <p style={styles.itemMeta}>
                          Volume: {item.variant?.size_ml}ml · Qty: {item.quantity}
                        </p>
                        <p style={styles.itemUnitPrice}>₹{item.price} each</p>
                      </div>

                      <div style={styles.itemSubtotalBox}>
                        <span style={styles.itemSubtotalVal}>₹{item.subtotal}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  <MapPin size={18} color="var(--ryox-gold-dark)" /> Shipping Destination
                </h2>
                <div style={styles.addrBox}>
                  <p style={styles.addrName}>{order.address.full_name}</p>
                  <p style={styles.addrText}>{order.address.address_line}</p>
                  <p style={styles.addrText}>
                    {order.address.city}, {order.address.state} — <strong>{order.address.pincode}</strong>
                  </p>
                  <p style={styles.addrText}>📞 +91 {order.address.phone}</p>
                </div>
              </div>
            )}

            {/* Cancel Order Action */}
            {['pending', 'confirmed'].includes(order.status) && (
              <button
                style={cancelling ? styles.cancelBtnDisabled : styles.cancelBtn}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Processing Cancellation...' : 'Cancel This Order'}
              </button>
            )}
          </div>

          {/* Payment & Price Breakdown Sidebar */}
          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Payment & Price Summary</h2>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Cart Subtotal</span>
              <span style={styles.summaryValue}>₹{order.total_amount}</span>
            </div>

            {parseFloat(order.discount_amount) > 0 && (
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>
                  Coupon Saved {order.coupon_code && `(${order.coupon_code})`}
                </span>
                <span style={{ ...styles.summaryValue, color: '#16a34a' }}>
                  -₹{order.discount_amount}
                </span>
              </div>
            )}

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Delivery Charge</span>
              <span style={{ ...styles.summaryValue, color: parseFloat(order.total_amount) >= 999 ? '#16a34a' : 'var(--ryox-text-heading)' }}>
                {parseFloat(order.total_amount) >= 999 ? 'FREE' : '₹99'}
              </span>
            </div>

            <div style={styles.divider} />

            <div style={styles.summaryRow}>
              <span style={styles.totalLabel}>Total Amount</span>
              <span style={styles.totalValue}>₹{order.final_amount}</span>
            </div>

            <div style={styles.paymentBox}>
              <p style={styles.paymentLabel}>Payment Method</p>
              <p style={styles.paymentVal}>
                {order.payment_method === 'cod' ? '💵 Cash on Delivery (COD)' : '💳 Razorpay Online Payment'}
              </p>
              <p style={{
                ...styles.paymentStatus,
                color: order.is_paid ? '#16a34a' : '#d97706'
              }}>
                {order.is_paid ? '✅ Payment Verified' : '⏳ Payment Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Tracking Modal */}
        {trackingModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setTrackingModalOpen(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Live Package Tracking</h3>
                <button style={styles.modalCloseBtn} onClick={() => setTrackingModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.modalAwbBox}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ryox-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>AWB Tracking Number</span>
                    <p style={{ color: 'var(--ryox-gold-dark)', fontSize: '1.2rem', fontWeight: '700', margin: '0.2rem 0 0' }}>
                      {order.tracking_number || `RYX-${order.id}9283-IN`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ryox-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Carrier</span>
                    <p style={{ color: 'var(--ryox-text-heading)', fontSize: '0.95rem', fontWeight: '600', margin: '0.2rem 0 0' }}>
                      {order.courier_partner || 'RyOx Express'}
                    </p>
                  </div>
                </div>

                <div style={styles.modalEventsList}>
                  {[
                    { title: 'Order Confirmed & Sealed', time: new Date(order.created_at).toLocaleString('en-IN'), done: true },
                    { title: 'Dispatched to Sorting Facility', time: 'In Progress', done: ['processing', 'shipped', 'delivered'].includes(order.status) },
                    { title: 'Out for Courier Delivery', time: 'Pending Dispatch', done: ['shipped', 'delivered'].includes(order.status) },
                    { title: 'Delivered to Customer', time: 'Estimated in 4-6 Days', done: order.status === 'delivered' },
                  ].map((evt, idx) => (
                    <div key={idx} style={styles.modalEventItem}>
                      <div style={{
                        ...styles.eventDot,
                        backgroundColor: evt.done ? '#16a34a' : '#f0ece3',
                        border: evt.done ? '2px solid #16a34a' : '2px solid #ccc',
                        color: evt.done ? '#ffffff' : '#8c847a',
                      }}>
                        {evt.done ? '✓' : ''}
                      </div>
                      <div>
                        <p style={{ color: evt.done ? 'var(--ryox-text-heading)' : 'var(--ryox-text-muted)', fontWeight: evt.done ? '600' : '400', fontSize: '0.95rem' }}>
                          {evt.title}
                        </p>
                        <span style={{ color: 'var(--ryox-text-subtle)', fontSize: '0.8rem' }}>{evt.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: 'var(--ryox-bg)', minHeight: '100vh', padding: '3rem 2rem 5rem', color: 'var(--ryox-text)' },
  container: { maxWidth: '1280px', margin: '0 auto' },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' },
  shopBtn: { background: 'var(--ryox-gold-gradient)', color: '#14120e', padding: '0.85rem 2rem', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' },

  backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--ryox-text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.8rem', fontWeight: '500' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--ryox-divider)' },
  headerSubtitle: { fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ryox-gold-dark)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' },
  title: { fontFamily: 'var(--ryox-font-serif)', color: 'var(--ryox-text-heading)', fontSize: '2.4rem', fontWeight: '500', margin: '0 0 0.3rem' },
  date: { color: 'var(--ryox-text-muted)', fontSize: '0.88rem' },
  headerBadgeWrap: { display: 'flex', alignItems: 'center' },
  statusBadge: { padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', letterSpacing: '0.5px' },

  // Tracker Card
  trackerCard: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem', boxShadow: 'var(--ryox-shadow-sm)' },
  trackerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' },
  trackerTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.18rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 },
  liveTrackBtn: { background: '#ffffff', border: '1px solid var(--ryox-gold-border)', color: 'var(--ryox-gold-dark)', padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: 'var(--ryox-shadow-sm)' },

  trackerBar: { display: 'flex', alignItems: 'flex-start', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' },
  trackStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: '100px', flex: 1 },
  trackDot: { width: '24px', height: '24px', borderRadius: '50%', marginBottom: '0.6rem', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' },
  trackLabel: { fontSize: '0.82rem', textAlign: 'center' },
  trackLine: { position: 'absolute', top: '11px', left: '50%', width: '100%', height: '2px', zIndex: 0 },

  logisticsBox: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--ryox-surface-subtle)', padding: '1.4rem', borderRadius: '12px', border: '1px solid var(--ryox-divider)' },
  logisticsItem: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  logisticsLabel: { fontSize: '0.72rem', color: 'var(--ryox-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' },
  logisticsValue: { fontSize: '0.95rem', fontWeight: '600', color: 'var(--ryox-text-heading)' },

  layout: { display: 'flex', gap: '2.5rem', flexWrap: 'wrap' },
  main: { flex: 2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  card: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--ryox-shadow-sm)' },
  cardTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.18rem', fontWeight: '600', marginBottom: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },

  itemsList: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--ryox-divider)' },
  itemImgWrap: { width: '75px', height: '75px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'radial-gradient(circle at center, #ffffff 0%, #f7f3eb 60%, #ece5d6 100%)', border: '1px solid var(--ryox-divider)' },
  itemImg: { width: '100%', height: '100%', objectFit: 'cover' },
  itemImgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' },
  itemDetails: { flex: 1 },
  itemName: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1rem', fontWeight: '600', textDecoration: 'none', display: 'block', marginBottom: '0.3rem' },
  itemMeta: { color: 'var(--ryox-text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' },
  itemUnitPrice: { color: 'var(--ryox-text-subtle)', fontSize: '0.82rem' },
  itemSubtotalBox: { textAlign: 'right' },
  itemSubtotalVal: { color: 'var(--ryox-text-heading)', fontSize: '1.15rem', fontWeight: '700' },

  addrBox: { background: 'var(--ryox-surface-subtle)', padding: '1.4rem', borderRadius: '12px', border: '1px solid var(--ryox-divider)' },
  addrName: { color: 'var(--ryox-text-heading)', fontWeight: '600', fontSize: '1rem', marginBottom: '0.4rem' },
  addrText: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' },

  cancelBtn: { width: '100%', padding: '1rem', backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' },
  cancelBtnDisabled: { width: '100%', padding: '1rem', backgroundColor: '#e5dfd5', border: 'none', color: '#a39b90', borderRadius: '10px', cursor: 'not-allowed', fontSize: '0.9rem' },

  summary: { flex: 1, minWidth: '300px', backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '2rem', height: 'fit-content', position: 'sticky', top: '100px', boxShadow: 'var(--ryox-shadow-md)' },
  summaryTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.4rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--ryox-divider)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' },
  summaryLabel: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem' },
  summaryValue: { color: 'var(--ryox-text-heading)', fontSize: '0.9rem', fontWeight: '600' },
  divider: { borderTop: '1px solid var(--ryox-divider)', margin: '1.2rem 0' },
  totalLabel: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.1rem', fontWeight: '700' },
  totalValue: { color: 'var(--ryox-text-heading)', fontSize: '1.4rem', fontWeight: '700' },

  paymentBox: { borderTop: '1px solid var(--ryox-divider)', paddingTop: '1.2rem', marginTop: '1.2rem' },
  paymentLabel: { color: 'var(--ryox-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem', fontWeight: '600' },
  paymentVal: { color: 'var(--ryox-text-heading)', fontSize: '0.95rem', marginBottom: '0.4rem', fontWeight: '600' },
  paymentStatus: { fontSize: '0.88rem', fontWeight: '700' },

  // Tracking Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  modalCard: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '18px', width: '100%', maxWidth: '520px', padding: '2.2rem', boxShadow: 'var(--ryox-shadow-lg)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--ryox-divider)' },
  modalTitle: { color: 'var(--ryox-text-heading)', fontSize: '1.25rem', fontWeight: '600', margin: 0, fontFamily: 'var(--ryox-font-serif)' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  modalAwbBox: { display: 'flex', justifyContent: 'space-between', background: 'var(--ryox-surface-subtle)', padding: '1.4rem', borderRadius: '12px', border: '1px solid var(--ryox-divider)' },
  modalEventsList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  modalEventItem: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  eventDot: { width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 },
}

export default OrderDetailPage