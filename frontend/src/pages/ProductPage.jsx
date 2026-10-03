import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct, getProducts } from '../api/products'
import {
  Heart,
  ShoppingBag,
  Star,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Sparkles,
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { getProductImage, getMediaUrl } from '../utils/imageUtils'
import './ProductPage.css'

function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')

  const { addItem: addToCart } = useCartStore()
  const {
    wishlist,
    fetchWishlist,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  // Fetch product data and manage recently viewed cache
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true)
      try {
        const res = await getProduct(slug)
        const prodData = res.data
        setProduct(prodData)

        const defaultVar = prodData.variants?.[0] || null
        setSelectedVariant(defaultVar)

        const initialImg = getProductImage(prodData)
        setMainImage(initialImg)
        setQuantity(1)

        // Fetch Wishlist if authenticated
        if (isAuthenticated) {
          fetchWishlist()
        }

        // Fetch Related Products by category
        if (prodData.category?.slug) {
          const relRes = await getProducts({ category: prodData.category.slug })
          const relList = relRes.data.results || relRes.data
          setRelated(relList.filter((p) => p.slug !== slug).slice(0, 4))
        }

        // Manage Recently Viewed Products in localStorage
        try {
          const stored = JSON.parse(
            localStorage.getItem('ryox_recently_viewed') || '[]'
          )
          const filtered = stored.filter((item) => item.slug !== prodData.slug)
          const currentItem = {
            id: prodData.id,
            name: prodData.name,
            slug: prodData.slug,
            brand: prodData.brand?.name || prodData.brand || 'RyOx',
            primary_image: initialImg,
            starting_price:
              defaultVar?.selling_price || prodData.starting_price || 0,
            category: prodData.category?.name || '',
          }
          const updatedRecentlyViewed = [currentItem, ...filtered].slice(0, 4)
          localStorage.setItem(
            'ryox_recently_viewed',
            JSON.stringify(updatedRecentlyViewed)
          )
          setRecentlyViewed(filtered.slice(0, 4))
        } catch {}
      } catch (err) {
        toast.error('Product not found')
      }
      setLoading(false)
    }

    fetchProductData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug, isAuthenticated])

  // Get active stock count
  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product?.stock ?? 0

  // Helper to extract top, heart, base notes from backend product model / inline notes
  const getNotes = (layer, fallback) => {
    if (!product) return fallback
    if (Array.isArray(product.fragrance_notes) && product.fragrance_notes.length > 0) {
      const filtered = product.fragrance_notes
        .filter((n) => n.note_type === layer)
        .map((n) => n.name)
      if (filtered.length > 0) return filtered.join(', ')
    }
    if (layer === 'top' && product.top_notes) return product.top_notes
    if (layer === 'heart' && product.heart_notes) return product.heart_notes
    if (layer === 'base' && product.base_notes) return product.base_notes
    if (product.scent_note?.name) return `${product.scent_note.name.charAt(0).toUpperCase() + product.scent_note.name.slice(1)} Accords`
    return fallback
  }

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    if (product.variants?.length > 0 && !selectedVariant) {
      toast.error('Please select a size')
      return
    }
    if (currentStock <= 0) {
      toast.error('Product is out of stock')
      return
    }
    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} available in stock`)
      return
    }

    const variantId = selectedVariant?.id || product.id
    const result = await addToCart(variantId, quantity)
    if (result.success) {
      toast.success(`${product.name} added to cart!`)
    } else {
      toast.error(result.error || 'Failed to add to cart')
    }
  }

  // Handle Buy Now (Add to cart & redirect to checkout)
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with Buy Now')
      return
    }
    if (product.variants?.length > 0 && !selectedVariant) {
      toast.error('Please select a size')
      return
    }
    if (currentStock <= 0) {
      toast.error('Product is out of stock')
      return
    }

    const variantId = selectedVariant?.id || product.id
    const result = await addToCart(variantId, quantity)
    if (result.success) {
      toast.success('Proceeding to checkout...')
      navigate('/checkout')
    } else {
      toast.error(result.error || 'Failed to process Buy Now')
    }
  }

  // Handle Wishlist Toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist')
      return
    }

    const inWish = isInWishlist(product.id)
    if (inWish) {
      const wishlistItem = wishlist?.items?.find(
        (item) => item.product?.id === product.id
      )
      if (wishlistItem) {
        const result = await removeFromWishlist(wishlistItem.id)
        if (result.success) {
          toast.success('Removed from wishlist')
        } else {
          toast.error('Failed to remove from wishlist')
        }
      }
    } else {
      const result = await addToWishlist(product.id)
      if (result.success) {
        toast.success('Saved to your wishlist!')
      } else {
        toast.error(result.error || 'Could not add to wishlist')
      }
    }
  }

  if (loading) {
    return (
      <div className="ryox-product-page">
        <div
          className="ryox-container"
          style={{
            padding: '8rem 0',
            textAlign: 'center',
            color: 'var(--ryox-gold-dark)',
          }}
        >
          <Sparkles
            size={40}
            className="animate-spin"
            style={{ marginBottom: '1rem' }}
          />
          <p
            style={{
              fontSize: '1.1rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Loading Fragrance Details...
          </p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="ryox-product-page">
        <div
          className="ryox-container"
          style={{ padding: '8rem 0', textAlign: 'center' }}
        >
          <h2
            style={{
              fontFamily: 'var(--ryox-font-serif)',
              fontSize: '2rem',
              marginBottom: '1rem',
              color: 'var(--ryox-text-heading)',
            }}
          >
            Fragrance Not Found
          </h2>
          <p
            style={{ color: 'var(--ryox-text-muted)', marginBottom: '2rem' }}
          >
            The perfume you are looking for is no longer available.
          </p>
          <Link
            to="/shop"
            className="ryox-btn-cart"
            style={{
              display: 'inline-flex',
              textDecoration: 'none',
              width: 'auto',
            }}
          >
            Back to Collection
          </Link>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const brandName =
    typeof product.brand === 'object'
      ? product.brand?.name
      : product.brand || 'RyOx Maison De Parfum'

  // Image list for thumbnails
  const rawImages =
    product.images && product.images.length > 0
      ? product.images
      : mainImage
      ? [{ id: 'main', image: mainImage, alt_text: product.name }]
      : []

  const topNoteVal = getNotes('top', 'Calabrian Bergamot, Pink Pepper')
  const heartNoteVal = getNotes('heart', 'Damask Rose, French Jasmine')
  const baseNoteVal = getNotes('base', 'Royal Amberwood, Bourbon Vanilla')

  return (
    <div className="ryox-product-page">
      <div className="ryox-container">
        {/* Breadcrumb Navigation */}
        <div className="ryox-breadcrumb">
          <Link to="/shop" className="ryox-bread-link">
            <ChevronLeft size={16} /> Collection
          </Link>
          <span className="ryox-bread-sep">/</span>
          {product.category && (
            <>
              <Link
                to={`/shop?category=${product.category.slug}`}
                className="ryox-bread-link"
              >
                {product.category.name}
              </Link>
              <span className="ryox-bread-sep">/</span>
            </>
          )}
          <span className="ryox-bread-current">{product.name}</span>
        </div>

        {/* Product Main Display */}
        <div className="ryox-product-main">
          {/* Image Gallery Section */}
          <div className="ryox-gallery-section">
            <div className="ryox-main-img-container">
              <div className="ryox-main-img-wrap">
                {mainImage ? (
                  <img
                    src={getMediaUrl(mainImage)}
                    alt={product.name}
                    className="ryox-main-img"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const fallback = e.target.parentElement.querySelector('.main-img-fallback')
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="main-img-fallback ryox-img-placeholder"
                  style={{ display: mainImage ? 'none' : 'flex' }}
                >
                  <span className="ryox-img-placeholder-icon">🧴</span>
                  <p style={{ fontSize: '0.85rem' }}>Luxury Fragrance Bottle</p>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {rawImages.length > 1 && (
              <div className="ryox-thumbnails-strip">
                {rawImages.map((imgItem) => {
                  const imgUrl = getMediaUrl(imgItem.image || imgItem)
                  return (
                    <button
                      key={imgItem.id || imgUrl}
                      className={`ryox-thumb-btn ${
                        mainImage === (imgItem.image || imgItem) ? 'active' : ''
                      }`}
                      onClick={() => setMainImage(imgItem.image || imgItem)}
                    >
                      <img
                        src={imgUrl}
                        alt={imgItem.alt_text || product.name}
                        className="ryox-thumb-img"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="ryox-info-section">
            {/* Brand Name & Stock Status */}
            <div className="ryox-brand-header">
              <span className="ryox-brand-name">{brandName}</span>
              {currentStock > 5 ? (
                <span className="ryox-stock-status-badge ryox-stock-in">
                  <CheckCircle2 size={13} /> In Stock
                </span>
              ) : currentStock > 0 ? (
                <span className="ryox-stock-status-badge ryox-stock-low">
                  <AlertTriangle size={13} /> Low Stock ({currentStock} left)
                </span>
              ) : (
                <span className="ryox-stock-status-badge ryox-stock-out">
                  <XCircle size={13} /> Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="ryox-product-title">{product.name}</h1>

            {/* Ratings & Reviews */}
            <div className="ryox-rating-row">
              <div className="ryox-stars-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={
                      star <= Math.round(product.rating || 5)
                        ? '#bfa15f'
                        : 'none'
                    }
                    color={
                      star <= Math.round(product.rating || 5)
                        ? '#bfa15f'
                        : '#ccc'
                    }
                  />
                ))}
              </div>
              <span className="ryox-rating-num">
                {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
              </span>
              <span
                className="ryox-reviews-count"
                onClick={() => setActiveTab('reviews')}
              >
                ({product.numReviews || product.reviews_count || 12} reviews)
              </span>
            </div>

            {/* Badges Bar */}
            <div className="ryox-badges-bar">
              {product.is_featured && (
                <span className="ryox-badge-item">✦ Signature Collection</span>
              )}
              {product.is_bestseller && (
                <span className="ryox-badge-item">🏆 Bestseller</span>
              )}
              {product.is_new_arrival && (
                <span className="ryox-badge-item">✨ New Arrival</span>
              )}
              <span className="ryox-badge-item">🌿 Eau De Parfum</span>
            </div>

            {/* Price Box */}
            <div className="ryox-price-container">
              <span className="ryox-price-current">
                ₹
                {selectedVariant
                  ? selectedVariant.selling_price
                  : product.starting_price || 0}
              </span>
              {selectedVariant &&
                selectedVariant.mrp > selectedVariant.selling_price && (
                  <>
                    <span className="ryox-price-mrp">
                      ₹{selectedVariant.mrp}
                    </span>
                    <span className="ryox-discount-pill">
                      {selectedVariant.discount_percent ||
                        Math.round(
                          ((selectedVariant.mrp - selectedVariant.selling_price) /
                            selectedVariant.mrp) *
                            100
                        )}
                      % OFF
                    </span>
                  </>
                )}
            </div>

            {/* Size Selector */}
            {product.variants?.length > 0 && (
              <div style={{ marginBottom: '1.8rem' }}>
                <p className="ryox-section-label">Select Bottle Volume</p>
                <div className="ryox-size-options">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`ryox-size-btn ${
                        selectedVariant?.id === variant.id ? 'active' : ''
                      }`}
                      onClick={() => {
                        setSelectedVariant(variant)
                        setQuantity(1)
                      }}
                      disabled={variant.stock === 0}
                    >
                      {variant.size_ml || variant.size}ml
                      {variant.stock === 0 && (
                        <span style={{ fontSize: '0.7rem', color: '#ef5350' }}>
                          (OOS)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Olfactory / Scent Notes Summary */}
            <div className="ryox-scent-notes-card">
              <div className="ryox-scent-notes-header">
                <Sparkles size={18} /> Olfactory Notes Pyramid
              </div>
              <div className="ryox-scent-grid">
                <div className="ryox-scent-pyramid-item">
                  <div className="ryox-scent-pyramid-label">Top Note</div>
                  <div className="ryox-scent-pyramid-val">{topNoteVal}</div>
                </div>
                <div className="ryox-scent-pyramid-item">
                  <div className="ryox-scent-pyramid-label">Heart Note</div>
                  <div className="ryox-scent-pyramid-val">{heartNoteVal}</div>
                </div>
                <div className="ryox-scent-pyramid-item">
                  <div className="ryox-scent-pyramid-label">Base Note</div>
                  <div className="ryox-scent-pyramid-val">{baseNoteVal}</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Actions */}
            <div className="ryox-controls-group">
              <p className="ryox-section-label">Quantity</p>
              <div className="ryox-qty-picker">
                <button
                  className="ryox-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || currentStock <= 0}
                >
                  −
                </button>
                <span className="ryox-qty-val">{quantity}</span>
                <button
                  className="ryox-qty-btn"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || currentStock <= 0}
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="ryox-action-row">
                <button
                  className="ryox-btn-cart"
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                >
                  <ShoppingBag size={18} />
                  {currentStock > 0 ? 'Add to Bag' : 'Out of Stock'}
                </button>

                <button
                  className="ryox-btn-buynow"
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                >
                  <Zap size={18} />
                  Buy Now
                </button>

                <button
                  className={`ryox-wishlist-toggle ${
                    inWishlist ? 'in-wishlist' : ''
                  }`}
                  onClick={handleWishlistToggle}
                  title={
                    inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'
                  }
                >
                  <Heart
                    size={20}
                    fill={inWishlist ? 'var(--ryox-gold)' : 'none'}
                    color={inWishlist ? 'var(--ryox-gold)' : '#2b2621'}
                  />
                </button>
              </div>
            </div>

            {/* Trust & Guarantee Highlights */}
            <div className="ryox-trust-features">
              <div className="ryox-trust-item">
                <Truck size={22} className="ryox-trust-icon" />
                <span className="ryox-trust-title">Complimentary Shipping</span>
                <span className="ryox-trust-sub">On orders above ₹999</span>
              </div>
              <div className="ryox-trust-item">
                <ShieldCheck size={22} className="ryox-trust-icon" />
                <span className="ryox-trust-title">100% Authentic</span>
                <span className="ryox-trust-sub">Crafted in Grasse, France</span>
              </div>
              <div className="ryox-trust-item">
                <RefreshCw size={22} className="ryox-trust-icon" />
                <span className="ryox-trust-title">7-Day Guarantee</span>
                <span className="ryox-trust-sub">Hassle-free returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="ryox-tabs-wrapper">
          <div className="ryox-tabs-header">
            <button
              className={`ryox-tab-btn ${
                activeTab === 'description' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description & Craftsmanship
            </button>
            <button
              className={`ryox-tab-btn ${
                activeTab === 'notes' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('notes')}
            >
              Fragrance Ingredients
            </button>
            <button
              className={`ryox-tab-btn ${
                activeTab === 'reviews' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Customer Reviews
            </button>
          </div>

          <div className="ryox-tab-panel">
            {activeTab === 'description' && (
              <div>
                <p style={{ marginBottom: '1.2rem', color: 'var(--ryox-text)' }}>
                  {product.description ||
                    'Immerse yourself in an intoxicating symphony of rare botanical extracts and opulent woods. Masterfully distilled by world-renowned perfumers, this luxury fragrance balances luminous top accords with deep, sensual base notes that linger gracefully on the skin.'}
                </p>
                <h4
                  style={{
                    color: 'var(--ryox-gold-dark)',
                    fontFamily: 'var(--ryox-font-serif)',
                    margin: '1.5rem 0 0.8rem',
                  }}
                >
                  How to Wear
                </h4>
                <p style={{ color: 'var(--ryox-text-muted)' }}>
                  Apply to pulse points—behind the ears, along the collarbone,
                  and inside the wrists. Allow the warmth of your skin to naturally
                  diffuse the fragrance throughout the day without rubbing the wrists
                  together.
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h4
                  style={{
                    color: 'var(--ryox-gold-dark)',
                    fontFamily: 'var(--ryox-font-serif)',
                    marginBottom: '1rem',
                  }}
                >
                  Key Fragrance Accords
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                  }}
                >
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span style={{ color: 'var(--ryox-gold)' }}>✦</span>
                    <strong>Top Accords:</strong> {topNoteVal}
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span style={{ color: 'var(--ryox-gold)' }}>✦</span>
                    <strong>Heart Accords:</strong> {heartNoteVal}
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span style={{ color: 'var(--ryox-gold)' }}>✦</span>
                    <strong>Base Accords:</strong> {baseNoteVal}
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection
                productId={product.id}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div>
            <h3 className="ryox-section-heading">You May Also Experience</h3>
            <div className="ryox-products-grid">
              {related.map((item) => {
                const relImg = getProductImage(item)
                return (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug}`}
                    className="ryox-product-card-luxury"
                  >
                    <div className="ryox-card-img-box">
                      {relImg ? (
                        <img src={relImg} alt={item.name} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                          }}
                        >
                          🧴
                        </div>
                      )}
                    </div>
                    <div className="ryox-card-body">
                      <span className="ryox-card-cat">
                        {item.category?.name || 'Perfume'}
                      </span>
                      <h4 className="ryox-card-title">{item.name}</h4>
                      <div className="ryox-card-price-row">
                        <span className="ryox-card-price-val">
                          {item.starting_price
                            ? `₹${item.starting_price}`
                            : 'Discover Price'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--ryox-gold-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontWeight: '700',
                          }}
                        >
                          Explore →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recently Viewed Products Section */}
        {recentlyViewed.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h3 className="ryox-section-heading">
              <Eye size={20} color="var(--ryox-gold-dark)" /> Recently Viewed
            </h3>
            <div className="ryox-products-grid">
              {recentlyViewed.map((item) => {
                const recImg = getMediaUrl(item.primary_image)
                return (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug}`}
                    className="ryox-product-card-luxury"
                  >
                    <div className="ryox-card-img-box">
                      {recImg ? (
                        <img src={recImg} alt={item.name} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                          }}
                        >
                          🧴
                        </div>
                      )}
                    </div>
                    <div className="ryox-card-body">
                      <span className="ryox-card-cat">{item.category}</span>
                      <h4 className="ryox-card-title">{item.name}</h4>
                      <div className="ryox-card-price-row">
                        <span className="ryox-card-price-val">
                          ₹{item.starting_price}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-component: Reviews & Review Form
function ReviewsSection({ productId, isAuthenticated }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ rating: 5, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { default: api } = await import('../api/axios')
        const res = await api.get(`/reviews/product/${productId}/`)
        setReviews(res.data)
      } catch {}
      setLoading(false)
    }
    fetchReviews()
  }, [productId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { default: api } = await import('../api/axios')
      await api.post('/reviews/create/', { ...form, product: productId })
      toast.success('Thank you! Your review has been submitted.')
      const res = await api.get(`/reviews/product/${productId}/`)
      setReviews(res.data)
      setForm({ rating: 5, title: '', body: '' })
    } catch (err) {
      toast.error(
        err.response?.data?.non_field_errors?.[0] || 'Failed to submit review'
      )
    }
    setSubmitting(false)
  }

  return (
    <div>
      {isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--ryox-surface-subtle)',
            border: '1px solid var(--ryox-divider)',
            borderRadius: '14px',
            padding: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <h3
            style={{
              color: 'var(--ryox-text-heading)',
              fontFamily: 'var(--ryox-font-serif)',
              fontSize: '1.2rem',
              marginBottom: '1rem',
            }}
          >
            Write a Fragrance Review
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginBottom: '1.2rem',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--ryox-text-muted)',
                marginRight: '0.5rem',
                fontWeight: '600',
              }}
            >
              Your Rating:
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                onClick={() => setForm({ ...form, rating: star })}
              >
                <Star
                  size={22}
                  fill={star <= form.rating ? '#bfa15f' : 'none'}
                  color={star <= form.rating ? '#bfa15f' : '#ccc'}
                />
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Headline / Summary of your impression"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--ryox-divider)',
              borderRadius: '8px',
              color: 'var(--ryox-text-heading)',
              fontSize: '0.9rem',
              outline: 'none',
              marginBottom: '1rem',
              boxSizing: 'border-box',
            }}
          />

          <textarea
            placeholder="Share details about longevity, projection, and occasion..."
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--ryox-divider)',
              borderRadius: '8px',
              color: 'var(--ryox-text-heading)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              marginBottom: '1.2rem',
            }}
            rows={4}
          />

          <button
            type="submit"
            className="ryox-btn-cart"
            style={{ width: 'auto', padding: '0.8rem 2.2rem' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--ryox-text-muted)' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--ryox-text-muted)' }}>
          No reviews yet. Be the first to share your impression of this scent!
        </p>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--ryox-divider)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: 'var(--ryox-shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.8rem',
                }}
              >
                <div>
                  <h5
                    style={{
                      color: 'var(--ryox-text-heading)',
                      fontSize: '1rem',
                      marginBottom: '0.3rem',
                      fontWeight: 600,
                    }}
                  >
                    {rev.user?.full_name || rev.user?.username || 'Verified Customer'}
                  </h5>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.2rem',
                      alignItems: 'center',
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= rev.rating ? '#bfa15f' : 'none'}
                        color={s <= rev.rating ? '#bfa15f' : '#ccc'}
                      />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.2rem',
                  }}
                >
                  {rev.is_verified && (
                    <span
                      style={{
                        color: '#2e7d32',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Verified Purchase
                    </span>
                  )}
                  <span
                    style={{
                      color: 'var(--ryox-text-subtle)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {new Date(rev.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {rev.title && (
                <p
                  style={{
                    color: 'var(--ryox-gold-dark)',
                    fontWeight: '600',
                    marginBottom: '0.4rem',
                  }}
                >
                  {rev.title}
                </p>
              )}
              {rev.body && (
                <p
                  style={{
                    color: 'var(--ryox-text)',
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                  }}
                >
                  {rev.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductPage