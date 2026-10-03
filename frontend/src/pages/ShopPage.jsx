import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, getCategories, getScentNotes } from '../api/products'
import { Heart, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { getProductImage } from '../utils/imageUtils'

function ShopPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [scentNotes, setScentNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const { addItem: addToCart } = useCartStore()
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  // read filters from URL
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const scent = searchParams.get('scent') || ''
  const featured = searchParams.get('featured') || ''
  const bestseller = searchParams.get('bestseller') || ''
  const new_arrival = searchParams.get('new_arrival') || ''
  const ordering = searchParams.get('ordering') || ''

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (category) params.category = category
        if (scent) params.scent = scent
        if (featured) params.featured = featured
        if (bestseller) params.bestseller = bestseller
        if (new_arrival) params.new_arrival = new_arrival
        if (ordering) params.ordering = ordering

        const [prodRes, catRes, scentRes] = await Promise.all([
          getProducts(params),
          getCategories(),
          getScentNotes(),
        ])
        setProducts(prodRes.data.results || prodRes.data)
        setCategories(catRes.data)
        setScentNotes(scentRes.data)
      } catch {
        toast.error('Failed to load products')
      }
      setLoading(false)
    }
    fetchAll()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchParams])

  const setFilter = (key, value) => {
    const params = Object.fromEntries(searchParams)
    if (value) params[key] = value
    else delete params[key]
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) { toast.error('Please login first'); return }
    const variant = product.variants?.[0]
    if (!variant) { toast.error('No variant available'); return }
    const result = await addToCart(variant.id, 1)
    if (result.success) toast.success('Added to bag!')
    else toast.error(result.error)
  }

  const handleWishlist = async (product) => {
    if (!isAuthenticated) { toast.error('Please login first'); return }
    const result = await addToWishlist(product.id)
    if (result.success) toast.success('Added to wishlist!')
    else toast.error(result.error || 'Already in wishlist')
  }

  const hasFilters = search || category || scent || featured || bestseller || new_arrival

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.header}>
        <span style={styles.headerEyebrow}>HAUTE PARFUMERIE</span>
        <h1 style={styles.title}>
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
            : search ? `Results for "${search}"`
              : 'The Fragrance Collection'}
        </h1>
        <p style={styles.count}>{products.length} artisanal creations found</p>
      </div>

      <div style={styles.layout}>
        {/* Sidebar Filters — Desktop */}
        <aside style={styles.sidebar}>
          <FilterPanel
            categories={categories}
            scentNotes={scentNotes}
            category={category}
            scent={scent}
            featured={featured}
            bestseller={bestseller}
            new_arrival={new_arrival}
            ordering={ordering}
            setFilter={setFilter}
            clearFilters={clearFilters}
            hasFilters={hasFilters}
          />
        </aside>

        {/* Main Content */}
        <div style={styles.main}>
          {/* Top bar */}
          <div style={styles.topBar}>
            <button
              style={styles.filterToggle}
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select
              style={styles.sort}
              value={ordering}
              onChange={(e) => setFilter('ordering', e.target.value)}
            >
              <option value="">Sort: Curated</option>
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div style={styles.loading}>Curating fragrances...</div>
          ) : products.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ color: 'var(--ryox-text-muted)', fontSize: '1.1rem' }}>No fragrances found matching your filters.</p>
              <button style={styles.clearBtn} onClick={clearFilters}>Reset Filters</button>
            </div>
          ) : (
            <div style={styles.grid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCart={() => handleAddToCart(product)}
                  onWishlist={() => handleWishlist(product)}
                  inWishlist={isInWishlist(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div style={styles.drawer}>
          <div style={styles.drawerContent}>
            <div style={styles.drawerHeader}>
              <h3 style={{ color: 'var(--ryox-text-heading)', margin: 0, fontFamily: 'var(--ryox-font-serif)' }}>Filters</h3>
              <button style={styles.closeBtn} onClick={() => setFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              scentNotes={scentNotes}
              category={category}
              scent={scent}
              featured={featured}
              bestseller={bestseller}
              new_arrival={new_arrival}
              ordering={ordering}
              setFilter={(k, v) => { setFilter(k, v); setFilterOpen(false) }}
              clearFilters={() => { clearFilters(); setFilterOpen(false) }}
              hasFilters={hasFilters}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Filter Panel
function FilterPanel({ categories, scentNotes, category, scent, featured,
  bestseller, new_arrival, setFilter, clearFilters, hasFilters }) {
  return (
    <div style={styles.filterPanel}>
      {hasFilters && (
        <button style={styles.clearBtn} onClick={clearFilters}>
          Clear All Filters
        </button>
      )}

      {/* Categories */}
      <div style={styles.filterGroup}>
        <h4 style={styles.filterTitle}>Category</h4>
        {[
          { label: 'All Categories', value: '' },
          { label: 'For Him', value: 'him' },
          { label: 'For Her', value: 'her' },
          { label: 'Unisex', value: 'unisex' },
          { label: 'Gifting', value: 'gifting' },
        ].map((cat) => (
          <button
            key={cat.value}
            style={category === cat.value ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setFilter('category', cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scent Notes */}
      {scentNotes.length > 0 && (
        <div style={styles.filterGroup}>
          <h4 style={styles.filterTitle}>Scent Accords</h4>
          <button
            style={!scent ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setFilter('scent', '')}
          >
            All Accords
          </button>
          {scentNotes.map((note) => (
            <button
              key={note.id}
              style={scent === note.name ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setFilter('scent', note.name)}
            >
              {note.name.charAt(0).toUpperCase() + note.name.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Collections */}
      <div style={styles.filterGroup}>
        <h4 style={styles.filterTitle}>Curated Collections</h4>
        <button
          style={featured ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter('featured', featured ? '' : 'true')}
        >
          ✦ Featured
        </button>
        <button
          style={bestseller ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter('bestseller', bestseller ? '' : 'true')}
        >
          🏆 Bestsellers
        </button>
        <button
          style={new_arrival ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter('new_arrival', new_arrival ? '' : 'true')}
        >
          ✨ New Arrivals
        </button>
      </div>
    </div>
  )
}

// Product Card
function ProductCard({ product, onCart, onWishlist, inWishlist }) {
  const imageUrl = getProductImage(product)
  return (
    <div style={styles.card}>
      <Link to={`/product/${product.slug}`} style={styles.cardImgWrap}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="ryox-shop-card-img"
            style={styles.cardImg}
            onError={(e) => {
              e.target.style.display = 'none'
              const fallback = e.target.parentElement.querySelector('.shop-img-placeholder')
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="shop-img-placeholder"
          style={{ ...styles.cardImgPlaceholder, display: imageUrl ? 'none' : 'flex' }}
        >
          <span style={{ fontSize: '3rem' }}>🧴</span>
        </div>
        <div style={styles.badges}>
          {product.is_new_arrival && <span style={styles.badgeNew}>New</span>}
          {product.is_bestseller && <span style={styles.badgeBest}>Best</span>}
        </div>
        <button
          style={{ ...styles.wishlistBtn, color: inWishlist ? 'var(--ryox-gold-dark)' : '#2b2621' }}
          onClick={(e) => { e.preventDefault(); onWishlist() }}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={inWishlist ? '#bfa15f' : 'none'} color={inWishlist ? '#bfa15f' : '#2b2621'} />
        </button>
      </Link>
      <div style={styles.cardInfo}>
        <p style={styles.cardCategory}>{product.category?.name || 'Eau De Parfum'}</p>
        <Link to={`/product/${product.slug}`} style={styles.cardName}>{product.name}</Link>
        <div style={styles.cardBottom}>
          <span style={styles.cardPrice}>
            {product.starting_price ? `₹${product.starting_price}` : 'View Price'}
          </span>
          <button style={styles.cartBtn} onClick={onCart} aria-label="Add to bag">
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    background: 'var(--ryox-bg)',
    minHeight: '100vh',
    color: 'var(--ryox-text)',
  },

  header: {
    padding: '4.5rem 2rem 2.2rem',
    maxWidth: '1320px',
    margin: '0 auto',
    position: 'relative',
  },

  headerEyebrow: {
    display: 'block',
    color: 'var(--ryox-gold-dark)',
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
  },

  title: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: 'clamp(2.2rem, 4vw, 3rem)',
    fontWeight: '500',
    letterSpacing: '-0.5px',
    marginBottom: '0.4rem',
  },

  count: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.85rem',
    letterSpacing: '1px',
  },

  layout: {
    display: 'flex',
    maxWidth: '1320px',
    margin: '0 auto',
    padding: '1rem 2rem 5rem',
    gap: '2.5rem',
  },

  sidebar: {
    width: '260px',
    flexShrink: 0,
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.8rem',
    gap: '1rem',
    flexWrap: 'wrap',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--ryox-divider)',
  },

  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    color: 'var(--ryox-text-heading)',
    padding: '0.65rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.74rem',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    boxShadow: 'var(--ryox-shadow-sm)',
    transition: 'all 0.3s ease',
  },

  sort: {
    background: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    color: 'var(--ryox-text-heading)',
    padding: '0.65rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    outline: 'none',
    boxShadow: 'var(--ryox-shadow-sm)',
    transition: 'all 0.3s ease',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.6rem',
  },

  loading: {
    color: 'var(--ryox-text-muted)',
    textAlign: 'center',
    padding: '6rem 2rem',
    fontSize: '1rem',
    letterSpacing: '1px',
  },

  empty: {
    textAlign: 'center',
    padding: '6rem 2rem',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid var(--ryox-divider)',
  },

  clearBtn: {
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.74rem',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '1.2rem',
    width: '100%',
    boxShadow: '0 4px 12px rgba(191, 161, 95, 0.25)',
    transition: 'all 0.3s ease',
  },

  filterPanel: {
    position: 'sticky',
    top: '95px',
    padding: '1.6rem',
    background: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '16px',
    boxShadow: 'var(--ryox-shadow-sm)',
  },

  filterGroup: {
    marginBottom: '1.6rem',
    paddingBottom: '1.2rem',
    borderBottom: '1px solid var(--ryox-divider)',
  },

  filterTitle: {
    color: 'var(--ryox-gold-dark)',
    fontSize: '0.68rem',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '0.9rem',
  },

  filterBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--ryox-text-muted)',
    padding: '0.5rem 0',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    letterSpacing: '0.3px',
    transition: 'all 0.25s ease',
  },

  filterBtnActive: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--ryox-gold-dark)',
    padding: '0.5rem 0',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },

  card: {
    position: 'relative',
    background: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--ryox-shadow-sm)',
    transition: 'transform 0.4s cubic-bezier(.16,1,.3,1), border-color 0.35s ease, box-shadow 0.4s ease',
  },

  cardImgWrap: {
    position: 'relative',
    display: 'block',
    height: '310px',
    overflow: 'hidden',
    textDecoration: 'none',
    background: 'radial-gradient(circle at center, #ffffff 0%, #f7f3eb 60%, #ece5d6 100%)',
  },

  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: 'scale(1.01)',
    transformOrigin: 'center center',
    transition: 'transform 1.1s cubic-bezier(.16,1,.3,1)',
  },

  cardImgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #ffffff 0%, #f7f3eb 60%, #ece5d6 100%)',
  },

  badges: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 4,
  },

  badgeNew: {
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    fontSize: '0.58rem',
    fontWeight: '800',
    padding: '5px 9px',
    borderRadius: '4px',
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
  },

  badgeBest: {
    background: '#1a1714',
    color: '#ffffff',
    fontSize: '0.58rem',
    fontWeight: '800',
    padding: '5px 9px',
    borderRadius: '4px',
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
  },

  wishlistBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 5,
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(8px)',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
  },

  cardInfo: {
    padding: '1.3rem 1.2rem',
    background: '#ffffff',
  },

  cardCategory: {
    color: 'var(--ryox-gold-dark)',
    fontSize: '0.62rem',
    fontWeight: '700',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },

  cardName: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.02rem',
    fontWeight: '600',
    lineHeight: '1.35',
    letterSpacing: '0.3px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '1rem',
    transition: 'color 0.3s ease',
  },

  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid var(--ryox-divider)',
  },

  cardPrice: {
    color: 'var(--ryox-text-heading)',
    fontSize: '1.12rem',
    fontWeight: '700',
  },

  cartBtn: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '50%',
    color: '#14120e',
    background: 'var(--ryox-gold-gradient)',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(191, 161, 95, 0.3)',
    transition: 'all 0.3s ease',
  },

  drawer: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    zIndex: 2000,
    display: 'flex',
  },

  drawerContent: {
    background: '#ffffff',
    width: '320px',
    height: '100%',
    overflowY: 'auto',
    padding: '1.8rem',
    boxShadow: '10px 0 40px rgba(0,0,0,0.15)',
  },

  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.8rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--ryox-divider)',
  },

  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#444',
    cursor: 'pointer',
  },
}

export default ShopPage