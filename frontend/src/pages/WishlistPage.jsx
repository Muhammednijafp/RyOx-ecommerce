import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, Sparkles, ChevronLeft, ArrowRight } from 'lucide-react'
import useWishlistStore from '../store/wishlistStore'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { getProductImage } from '../utils/imageUtils'
import './WishlistPage.css'

function WishlistPage() {
  const { wishlist, totalItems, fetchWishlist, removeItem, loading } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchWishlist()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleMoveToCart = async (product) => {
    const variant = product.variants?.[0]
    const variantId = variant?.id || product.id
    const result = await addToCart(variantId, 1)
    if (result.success) {
      toast.success(`${product.name} added to bag!`)
    } else {
      toast.error(result.error || 'Failed to add to bag')
    }
  }

  const handleRemove = async (itemId, productName) => {
    const result = await removeItem(itemId)
    if (result.success) {
      toast.success(`${productName || 'Item'} removed from wishlist`)
    } else {
      toast.error('Failed to remove item')
    }
  }

  const handleAddAllToCart = async () => {
    if (!wishlist?.items || wishlist.items.length === 0) return
    let addedCount = 0
    for (const item of wishlist.items) {
      if (item.product) {
        const variant = item.product.variants?.[0]
        const variantId = variant?.id || item.product.id
        const res = await addToCart(variantId, 1)
        if (res.success) addedCount++
      }
    }
    if (addedCount > 0) {
      toast.success(`Moved ${addedCount} fragrances to your shopping bag!`)
    } else {
      toast.error('Could not move items to bag')
    }
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div style={{ textAlign: 'center', padding: '8rem 0' }}>
            <Sparkles size={36} color="#bfa15f" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--ryox-gold-dark)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
              Curating Your Saved Fragrances...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!wishlist || wishlist.items?.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-empty">
            <div className="wishlist-empty-circle">
              <Heart size={40} color="#bfa15f" />
            </div>
            <h2 className="wishlist-empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-empty-desc">
              Explore our artisanal perfume collection and save your favorite olfactory creations.
            </p>
            <Link to="/shop" className="wishlist-shop-btn">
              Discover Fragrances <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* LUXURY FOOTER */}
        <Footer />
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* Breadcrumb */}
        <div className="wishlist-breadcrumb">
          <Link to="/shop" className="wishlist-bread-link">
            <ChevronLeft size={16} /> Shop Collection
          </Link>
          <span style={{ color: 'rgba(0,0,0,0.2)' }}>/</span>
          <span style={{ color: 'var(--ryox-text-heading)', fontWeight: '600' }}>Saved Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="wishlist-header">
          <div>
            <span className="wishlist-subtitle">CURATED COLLECTION</span>
            <h1 className="wishlist-title">My Saved Fragrances</h1>
            <p className="wishlist-count">{totalItems} {totalItems === 1 ? 'fragrance' : 'fragrances'} saved</p>
          </div>

          {wishlist.items.length > 0 && (
            <button className="wishlist-add-all-btn" onClick={handleAddAllToCart}>
              <ShoppingBag size={18} /> Move All to Bag
            </button>
          )}
        </div>

        {/* Wishlist Grid with Card Hover Effects */}
        <div className="wishlist-grid">
          {wishlist.items.map((item) => {
            const product = item.product || {}
            const brand = typeof product.brand === 'object' ? product.brand?.name : product.brand || 'RyOx Maison'
            const startingPrice = product.starting_price || product.variants?.[0]?.selling_price
            const imageUrl = getProductImage(product)

            return (
              <div key={item.id} className="wishlist-card">
                {/* Product Image */}
                <Link to={`/product/${product.slug}`} className="wishlist-img-wrap">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="wishlist-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const fallback = e.target.parentElement.querySelector('.wishlist-img-fallback')
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}

                  <div
                    className="wishlist-img-fallback"
                    style={{ display: imageUrl ? 'none' : 'flex' }}
                  >
                    <span>🧴</span>
                  </div>

                  {/* Top Badges */}
                  <div className="wishlist-badge-wrap">
                    {product.is_bestseller && <span className="wishlist-badge-gold">BESTSELLER</span>}
                    {product.is_new_arrival && <span className="wishlist-badge-new">NEW</span>}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="wishlist-info">
                  <p className="wishlist-brand">{brand}</p>
                  <Link to={`/product/${product.slug}`} className="wishlist-name">
                    {product.name}
                  </Link>

                  <p className="wishlist-price">
                    {startingPrice ? `₹${startingPrice}` : 'View Price'}
                  </p>

                  {/* Actions */}
                  <div className="wishlist-actions">
                    <button
                      className="wishlist-cart-btn"
                      onClick={() => handleMoveToCart(product)}
                    >
                      <ShoppingBag size={15} />
                      Add to Bag
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => handleRemove(item.id, product.name)}
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* LUXURY FOOTER */}
      <Footer />
    </div>
  )
}

/* ============================================================
   SHARED LUXURY FOOTER COMPONENT
============================================================ */
function Footer() {
  return (
    <footer className="luxury-footer">
      <div className="footer-statement">
        <p className="footer-eyebrow">THE ART OF FRAGRANCE</p>
        <h2 className="footer-headline">
          A fragrance is not worn.
          <br />
          <span>It is remembered.</span>
        </h2>
        <p className="footer-statement-text">
          Discover scents crafted to become part of your unforgettable story.
          Welcome to the world of RyOx.
        </p>
        <Link to="/shop" className="footer-explore">
          ENTER THE RYOX WORLD
          <span className="footer-arrow">→</span>
        </Link>
      </div>

      <div className="footer-main">
        {/* BRAND */}
        <div className="footer-brand">
          <div className="footer-brand-logo">
            RY<span>OX</span>
          </div>
          <p className="footer-tagline">REMEMBER YOUR OWN EXPERIENCE</p>
          <p className="footer-brand-text">
            Haute fragrances inspired by rare ouds, precious woods, delicate florals, and timeless memories.
          </p>
          <div className="footer-socials">
            <a href="#" className="social">Instagram</a>
            <a href="#" className="social">Facebook</a>
            <a href="#" className="social">Pinterest</a>
          </div>
        </div>

        {/* EXPLORE */}
        <div className="footer-column">
          <h4 className="footer-column-title">EXPLORE</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/shop" className="footer-link">Collection</Link>
          <Link to="/shop?category=him" className="footer-link">For Him</Link>
          <Link to="/shop?category=her" className="footer-link">For Her</Link>
        </div>

        {/* THE HOUSE */}
        <div className="footer-column">
          <h4 className="footer-column-title">THE HOUSE</h4>
          <Link to="/shop" className="footer-link">Our Collection</Link>
          <Link to="/shop?bestseller=true" className="footer-link">Bestsellers</Link>
          <Link to="/shop?new_arrival=true" className="footer-link">New Arrivals</Link>
          <Link to="/wishlist" className="footer-link">Wishlist</Link>
          <Link to="/orders" className="footer-link">My Orders</Link>
        </div>

        {/* CUSTOMER CARE */}
        <div className="footer-column">
          <h4 className="footer-column-title">CUSTOMER CARE</h4>
          <Link to="/profile" className="footer-link">My Account</Link>
          <Link to="/cart" className="footer-link">Shopping Bag</Link>
          <Link to="/orders" className="footer-link">Order Tracking</Link>
          <Link to="/login" className="footer-link">Sign In</Link>
          <Link to="/register" className="footer-link">Create Account</Link>
        </div>

        {/* NEWSLETTER */}
        <div className="footer-newsletter">
          <h4 className="footer-column-title">STAY IN THE WORLD OF RYOX</h4>
          <p className="newsletter-text">
            Be the first to discover new seasonal extraits, private reserves, and exclusive invitations.
          </p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
            />
            <button className="newsletter-button" type="button" aria-label="Subscribe">
              →
            </button>
          </div>
        </div>
      </div>

      {/* WATERMARK */}
      <div className="footer-watermark">RYOX</div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 RYOX MAISON DE PARFUM. ALL RIGHTS RESERVED.</p>
        <div className="footer-legal">
          <a href="#" className="legal-link">Privacy Policy</a>
          <a href="#" className="legal-link">Terms of Service</a>
          <a href="#" className="legal-link">Shipping & Returns</a>
        </div>
        <p className="footer-made">CRAFTED WITH INTENTION</p>
      </div>
    </footer>
  )
}

export default WishlistPage