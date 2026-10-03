import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react'
import useCartStore from '../store/cartStore'
import toast from 'react-hot-toast'
import { getProductImage } from '../utils/imageUtils'

function CartPage() {
  const { cart, totalItems, totalPrice, fetchCart, updateItem, removeItem, loading } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleUpdate = async (itemId, quantity) => {
    const result = await updateItem(itemId, quantity)
    if (!result.success) toast.error('Failed to update quantity')
  }

  const handleRemove = async (itemId) => {
    const result = await removeItem(itemId)
    if (result.success) toast.success('Item removed from shopping bag')
    else toast.error('Failed to remove item')
  }

  if (loading) return <div style={styles.loading}>Curating your shopping bag...</div>

  if (!cart || cart.items?.length === 0) {
    return (
      <div style={styles.empty}>
        <ShoppingBag size={56} color="#bfa15f" opacity={0.6} />
        <h2 style={styles.emptyTitle}>Your Shopping Bag is Empty</h2>
        <p style={styles.emptyDesc}>Discover our collection of rare botanical perfumes and signature scents.</p>
        <Link to="/shop" style={styles.shopBtn}>Explore Collection</Link>
      </div>
    )
  }

  const deliveryFee = parseFloat(totalPrice) >= 999 ? 0 : 99
  const totalWithDelivery = (parseFloat(totalPrice) + deliveryFee).toFixed(2)

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <span style={styles.headerEyebrow}>YOUR SELECTION</span>
            <h1 style={styles.title}>Shopping Bag</h1>
          </div>
          <p style={styles.count}>{totalItems} creation{totalItems !== 1 ? 's' : ''}</p>
        </div>

        <div style={styles.layout}>
          {/* Cart Items */}
          <div style={styles.items}>
            {cart.items.map((item) => {
              const itemImg = getProductImage(item.product) || getProductImage(item.variant?.product)
              return (
                <div key={item.id} style={styles.item}>
                  {/* Product Image */}
                  <Link to={`/product/${item.product?.slug}`} style={styles.imgWrap}>
                    {itemImg ? (
                      <img
                        src={itemImg}
                        alt={item.product?.name}
                        style={styles.img}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          const fb = e.target.parentElement.querySelector('.cart-img-fb')
                          if (fb) fb.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="cart-img-fb" style={{ ...styles.imgPlaceholder, display: itemImg ? 'none' : 'flex' }}>
                      🧴
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div style={styles.itemInfo}>
                    <Link
                      to={`/product/${item.product?.slug}`}
                      style={styles.itemName}
                    >
                      {item.product?.name}
                    </Link>
                    <p style={styles.itemVariant}>
                      Bottle Volume: {item.variant?.size_ml}ml
                    </p>
                    <p style={styles.itemPrice}>
                      ₹{item.variant?.selling_price} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div style={styles.qtyControls}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={styles.qty}>{item.quantity}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={styles.subtotal}>
                    <p style={styles.subtotalPrice}>₹{item.subtotal}</p>
                    <button
                      style={styles.removeBtn}
                      onClick={() => handleRemove(item.id)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Bag Summary</h2>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal ({totalItems} items)</span>
              <span style={styles.summaryValue}>₹{totalPrice}</span>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Estimated Shipping</span>
              <span style={{
                ...styles.summaryValue,
                color: deliveryFee === 0 ? '#2e7d32' : 'var(--ryox-text-heading)',
                fontWeight: '600'
              }}>
                {deliveryFee === 0 ? 'Complimentary' : `₹${deliveryFee}`}
              </span>
            </div>

            {parseFloat(totalPrice) < 999 && (
              <p style={styles.freeShipping}>
                Add ₹{(999 - parseFloat(totalPrice)).toFixed(2)} more for complimentary shipping
              </p>
            )}

            <div style={styles.divider} />

            <div style={styles.summaryRow}>
              <span style={styles.totalLabel}>Estimated Total</span>
              <span style={styles.totalValue}>₹{totalWithDelivery}</span>
            </div>

            <button
              style={styles.checkoutBtn}
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <Link to="/shop" style={styles.continueBtn}>
              Continue Shopping
            </Link>

            <div style={styles.trustWrap}>
              <ShieldCheck size={16} color="#2e7d32" />
              <span>Guaranteed Authentic & Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    backgroundColor: 'var(--ryox-bg)',
    minHeight: '100vh',
    padding: '3rem 2rem 5rem',
  },

  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },

  loading: {
    color: 'var(--ryox-text-muted)',
    textAlign: 'center',
    padding: '8rem 2rem',
    fontSize: '1.1rem',
  },

  empty: {
    minHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.2rem',
    textAlign: 'center',
    padding: '2rem',
  },

  emptyTitle: {
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.8rem',
    fontWeight: '500',
    color: 'var(--ryox-text-heading)',
  },

  emptyDesc: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.95rem',
    maxWidth: '420px',
  },

  shopBtn: {
    marginTop: '0.8rem',
    padding: '0.9rem 2.4rem',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.82rem',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    boxShadow: '0 8px 25px rgba(191, 161, 95, 0.35)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '2.5rem',
    paddingBottom: '1.2rem',
    borderBottom: '1px solid var(--ryox-divider)',
  },

  headerEyebrow: {
    display: 'block',
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: 'var(--ryox-gold-dark)',
    marginBottom: '0.3rem',
  },

  title: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '2.4rem',
    fontWeight: '500',
    letterSpacing: '-0.5px',
    margin: 0,
  },

  count: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.88rem',
  },

  layout: {
    display: 'flex',
    gap: '2.5rem',
    flexWrap: 'wrap',
  },

  items: {
    flex: 2,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },

  item: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: 'var(--ryox-shadow-sm)',
    flexWrap: 'wrap',
  },

  imgWrap: {
    width: '95px',
    height: '95px',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
    textDecoration: 'none',
    background: 'radial-gradient(circle at center, #ffffff 0%, #f7f3eb 60%, #ece5d6 100%)',
    border: '1px solid var(--ryox-divider)',
  },

  img: { width: '100%', height: '100%', objectFit: 'cover' },

  imgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.2rem',
  },

  itemInfo: { flex: 1, minWidth: '160px' },

  itemName: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.05rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '0.3rem',
  },

  itemVariant: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.82rem',
    marginBottom: '0.3rem',
  },

  itemPrice: {
    color: 'var(--ryox-gold-dark)',
    fontSize: '0.92rem',
    fontWeight: '700',
  },

  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    background: 'var(--ryox-surface-subtle)',
    padding: '0.3rem 0.5rem',
    borderRadius: '8px',
    border: '1px solid var(--ryox-divider)',
  },

  qtyBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--ryox-text)',
    width: '26px',
    height: '26px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qty: {
    color: 'var(--ryox-text-heading)',
    fontWeight: '700',
    minWidth: '22px',
    textAlign: 'center',
    fontSize: '0.92rem',
  },

  subtotal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.6rem',
  },

  subtotalPrice: {
    color: 'var(--ryox-text-heading)',
    fontWeight: '700',
    fontSize: '1.15rem',
  },

  removeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#a3483b',
    cursor: 'pointer',
    padding: '0.3rem',
    transition: 'color 0.2s ease',
  },

  summary: {
    flex: 1,
    minWidth: '300px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '16px',
    padding: '2rem',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
    boxShadow: 'var(--ryox-shadow-md)',
  },

  summaryTitle: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    paddingBottom: '0.8rem',
    borderBottom: '1px solid var(--ryox-divider)',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.9rem',
  },

  summaryLabel: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.88rem',
  },

  summaryValue: {
    color: 'var(--ryox-text-heading)',
    fontSize: '0.92rem',
    fontWeight: '600',
  },

  freeShipping: {
    color: '#8f7234',
    fontSize: '0.8rem',
    marginBottom: '1rem',
    background: 'rgba(191, 161, 95, 0.1)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontWeight: '500',
  },

  divider: {
    borderTop: '1px solid var(--ryox-divider)',
    margin: '1.2rem 0',
  },

  totalLabel: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.1rem',
    fontWeight: '700',
  },

  totalValue: {
    color: 'var(--ryox-text-heading)',
    fontSize: '1.4rem',
    fontWeight: '700',
  },

  checkoutBtn: {
    width: '100%',
    padding: '1.1rem',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '1.6rem',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 8px 25px rgba(191, 161, 95, 0.35)',
    transition: 'all 0.3s ease',
  },

  continueBtn: {
    display: 'block',
    textAlign: 'center',
    color: 'var(--ryox-text-muted)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    marginTop: '1rem',
    fontWeight: '500',
  },

  trustWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--ryox-divider)',
    fontSize: '0.72rem',
    color: 'var(--ryox-text-muted)',
  },
}

export default CartPage