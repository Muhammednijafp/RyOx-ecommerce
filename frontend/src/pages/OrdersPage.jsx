import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../api/orders'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { getProductImage } from '../utils/imageUtils'
import toast from 'react-hot-toast'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders()
        setOrders(res.data)
      } catch {
        toast.error('Failed to load orders')
      }
      setLoading(false)
    }
    fetchOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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

  if (loading) return <div style={styles.loading}>Curating your order history...</div>

  if (orders.length === 0) {
    return (
      <div style={styles.empty}>
        <ShoppingBag size={56} color="#bfa15f" opacity={0.6} />
        <h2 style={styles.emptyTitle}>No orders placed yet</h2>
        <p style={styles.emptyDesc}>Your purchased fragrances and order tracking details will appear here.</p>
        <Link to="/shop" style={styles.shopBtn}>Explore Collection</Link>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Orders</h1>
      <p style={styles.count}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

      <div style={styles.list}>
        {orders.map((order) => (
          <Link to={`/orders/${order.id}`} key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <div style={styles.orderHeader}>
              <div>
                <p style={styles.orderId}>Order #{order.id}</p>
                <p style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
              <div style={styles.orderRight}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: statusColor(order.status) + '18',
                  color: statusColor(order.status),
                  border: `1px solid ${statusColor(order.status)}40`,
                }}>
                  ● {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <ChevronRight size={18} color="#8c847a" />
              </div>
            </div>

            {/* Order Items Preview with Product Images */}
            <div style={styles.itemsPreview}>
              {order.items?.slice(0, 4).map((item) => {
                const itemImg = getProductImage(item.product) || getProductImage(item.variant?.product)
                return (
                  <div key={item.id} style={styles.previewItem}>
                    <div style={styles.itemImgWrap}>
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.product?.name || 'Fragrance'}
                          style={styles.itemImg}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span style={styles.fallbackEmoji}>🧴</span>
                      )}
                    </div>
                    <div style={styles.previewInfo}>
                      <span style={styles.previewName}>{item.product?.name}</span>
                      <span style={styles.previewSub}>
                        {item.variant?.size_ml ? `${item.variant.size_ml}ml · ` : ''}Qty: {item.quantity}
                      </span>
                    </div>
                    <span style={styles.previewPrice}>₹{item.price}</span>
                  </div>
                )
              })}
              {order.items?.length > 4 && (
                <p style={styles.moreItems}>+{order.items.length - 4} more items</p>
              )}
            </div>

            {/* Order Footer */}
            <div style={styles.orderFooter}>
              <div>
                <p style={styles.footerLabel}>Payment</p>
                <p style={styles.footerValue}>
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}
                  {' · '}
                  <span style={{ color: order.is_paid ? '#16a34a' : '#d97706', fontWeight: '600' }}>
                    {order.is_paid ? 'Paid' : 'Pending'}
                  </span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={styles.footerLabel}>Total</p>
                <p style={styles.orderTotal}>₹{order.final_amount}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: 'var(--ryox-bg)', minHeight: '100vh', padding: '3rem 2rem 5rem', maxWidth: '960px', margin: '0 auto', color: 'var(--ryox-text)' },
  loading: { color: 'var(--ryox-text-muted)', textAlign: 'center', padding: '6rem', fontSize: '1.1rem' },
  title: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '2.4rem', fontWeight: '500', marginBottom: '0.3rem' },
  count: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', marginBottom: '2.2rem' },

  empty: {
    minHeight: '75vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '1.2rem', textAlign: 'center',
    padding: '2rem',
  },
  emptyTitle: { fontSize: '1.8rem', fontWeight: '500', fontFamily: 'var(--ryox-font-serif)', color: 'var(--ryox-text-heading)' },
  emptyDesc: { color: 'var(--ryox-text-muted)', fontSize: '0.95rem', maxWidth: '420px' },
  shopBtn: {
    marginTop: '0.8rem', padding: '0.9rem 2.2rem',
    background: 'var(--ryox-gold-gradient)', color: '#14120e',
    textDecoration: 'none', borderRadius: '8px',
    fontWeight: '700', fontSize: '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    boxShadow: '0 8px 25px rgba(191,161,95,0.35)',
  },

  list: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },

  orderCard: {
    backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)',
    borderRadius: '16px', padding: '1.8rem',
    textDecoration: 'none', display: 'block',
    boxShadow: 'var(--ryox-shadow-sm)',
    transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  },

  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.2rem',
  },
  orderId: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.3rem' },
  orderDate: { color: 'var(--ryox-text-muted)', fontSize: '0.85rem' },
  orderRight: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  statusBadge: {
    padding: '0.35rem 0.9rem', borderRadius: '20px',
    fontSize: '0.78rem', fontWeight: '700',
  },

  itemsPreview: {
    backgroundColor: 'var(--ryox-surface-subtle)', borderRadius: '12px',
    padding: '1rem 1.2rem', marginBottom: '1.2rem', border: '1px solid var(--ryox-divider)',
    display: 'flex', flexDirection: 'column', gap: '0.7rem',
  },
  previewItem: {
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  itemImgWrap: {
    width: '46px', height: '46px', borderRadius: '8px',
    backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  itemImg: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  fallbackEmoji: {
    fontSize: '1.3rem',
  },
  previewInfo: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem',
  },
  previewName: { color: 'var(--ryox-text-heading)', fontSize: '0.88rem', fontWeight: '600' },
  previewSub: { color: 'var(--ryox-text-muted)', fontSize: '0.78rem' },
  previewPrice: { color: 'var(--ryox-text-heading)', fontSize: '0.88rem', fontWeight: '600' },
  moreItems: { color: 'var(--ryox-gold-dark)', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: '600' },

  orderFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', borderTop: '1px solid var(--ryox-divider)', paddingTop: '1.2rem',
  },
  footerLabel: { color: 'var(--ryox-text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' },
  footerValue: { color: 'var(--ryox-text-heading)', fontSize: '0.88rem' },
  orderTotal: { color: 'var(--ryox-text-heading)', fontSize: '1.2rem', fontWeight: '700' },
}

export default OrdersPage