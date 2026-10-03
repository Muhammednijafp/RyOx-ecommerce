import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getCategories } from '../api/products'
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Droplets,
  Wind,
  Flame,
  ShieldCheck,
  Award,
  Clock,
  Star,
  ChevronDown,
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { getProductImage } from '../utils/imageUtils'
import './HomePage.css'

function HomePage() {
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const { addItem: addToCart } = useCartStore()
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, bestRes, newRes, catRes] = await Promise.all([
          getProducts({ featured: true }),
          getProducts({ bestseller: true }),
          getProducts({ new_arrival: true }),
          getCategories(),
        ])

        setFeatured(featRes.data.results || featRes.data)
        setBestsellers(bestRes.data.results || bestRes.data)
        setNewArrivals(newRes.data.results || newRes.data)
        setCategories(catRes.data)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load products')
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart')
      return
    }

    const variant = product.variants?.[0]
    if (!variant) {
      toast.error('No variant available')
      return
    }

    const result = await addToCart(variant.id, 1)
    if (result.success) {
      toast.success(`${product.name} added to your bag!`)
    } else {
      toast.error(result.error)
    }
  }

  const handleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }

    const result = await addToWishlist(product.id)
    if (result.success) {
      toast.success('Saved to your wishlist!')
    } else {
      toast.error(result.error || 'Already in wishlist')
    }
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="home-loading">
        <div className="luxury-loader">
          <span>RY</span>
          <span>OX</span>
        </div>
        <p>CURATING YOUR OLFACTORY EXPERIENCE</p>
      </div>
    )
  }

  return (
    <div className="ryox-home">
      {/* =====================================================
          1. HAUTE PARFUMERIE GRAND HERO
      ===================================================== */}
      <section className="premium-hero">
        <div className="hero-backdrop">
          <div className="hero-radial-glow"></div>
          <div className="hero-ambient-orb hero-ambient-orb--1"></div>
          <div className="hero-ambient-orb hero-ambient-orb--2"></div>
        </div>

        <div className="hero-frame-border hero-frame-border--top"></div>
        <div className="hero-frame-border hero-frame-border--bottom"></div>

        <div className="hero-inner">
          <div className="hero-prestige-badge">
            <span className="badge-sparkle">✦</span>
            <span>MAISON DE HAUTE PARFUMERIE</span>
            <span className="badge-sparkle">✦</span>
          </div>

          <p className="hero-eyebrow">
            DISTILLED IN GRASSE · CRAFTED FOR THE EXTRAORDINARY
          </p>

          <h1 className="hero-headline">
            SCENTS THAT BECOME
            <span className="hero-gold-text">MEMORIES.</span>
          </h1>

          <p className="hero-subtext">
            Immerse yourself in rare botanical essences, aged oud, and precious florals.
            Each RyOx creation is an intimate memory bottled with exquisite artistry.
          </p>

          <div className="hero-cta-group">
            <Link to="/shop" className="hero-primary-btn">
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={() => scrollToSection('featured-section')}
              className="hero-secondary-btn"
            >
              <span>Discover Bestsellers</span>
            </button>
          </div>

          {/* Quality Trust Indicators */}
          <div className="hero-trust-bar">
            <div className="trust-pill">
              <Award size={14} color="#bfa15f" />
              <span>100% Extrait De Parfum</span>
            </div>
            <div className="trust-pill-divider">·</div>
            <div className="trust-pill">
              <Clock size={14} color="#bfa15f" />
              <span>12h+ Enduring Sillage</span>
            </div>
            <div className="trust-pill-divider">·</div>
            <div className="trust-pill">
              <ShieldCheck size={14} color="#bfa15f" />
              <span>Artisanal French Distillation</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="hero-scroll-indicator"
          onClick={() => scrollToSection('accords-ribbon')}
        >
          <span>SCROLL TO EXPLORE</span>
          <div className="hero-scroll-mouse">
            <div className="hero-scroll-wheel"></div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. OLFACTORY ACCORDS MARQUEE RIBBON
      ===================================================== */}
      <div id="accords-ribbon" className="accords-ribbon">
        <div className="accords-marquee">
          <div className="accords-track">
            {[
              'CALABRIAN BERGAMOT',
              'DAMASK ROSE',
              'ROYAL AMBERWOOD',
              'BOURBON VANILLA',
              'NIGHT JASMINE',
              'SMOKY OUD',
              'PINK PEPPER',
              'FRENCH LAVENDER',
              'CALABRIAN BERGAMOT',
              'DAMASK ROSE',
              'ROYAL AMBERWOOD',
              'BOURBON VANILLA',
              'NIGHT JASMINE',
              'SMOKY OUD',
            ].map((accord, idx) => (
              <span key={idx} className="accord-item">
                <span className="accord-star">✦</span>
                <span className="accord-name">{accord}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          3. MAISON HERITAGE & THE ART OF PERFUMERY
      ===================================================== */}
      <section className="ryox-section heritage-section">
        <div className="heritage-grid">
          <div className="heritage-visual">
            <div className="heritage-card-wrap">
              <div className="heritage-card-glow"></div>
              <div className="heritage-image-box">
                <div className="heritage-seal">
                  <span>EST.</span>
                  <strong>2026</strong>
                  <span>GRASSE</span>
                </div>
                <div className="heritage-botanical-badge">
                  <Droplets size={18} color="#bfa15f" />
                  <div>
                    <strong>Pure Maceration</strong>
                    <small>45 Days Cold Process</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="heritage-content">
            <span className="section-eyebrow">OUR PHILOSOPHY</span>
            <h2 className="heritage-title">
              Rooted in French Heritage,
              <br />
              <span>Perfected in Modern Luxury.</span>
            </h2>
            <p className="heritage-lead">
              At RyOx, we believe a fragrance is never merely worn—it becomes an indelible signature of your persona and an unforgettable emotion.
            </p>
            <p className="heritage-desc">
              Sourcing the world’s rarest petals from Grasse, rich sandalwood from Mysore, and golden amber from Madagascar, our master perfumers blend time-honored artisanal distillation with modern sophistication.
            </p>

            <div className="heritage-stats">
              <div className="stat-card">
                <strong>100%</strong>
                <span>Natural Essences</span>
              </div>
              <div className="stat-card">
                <strong>45+</strong>
                <span>Days Macerated</span>
              </div>
              <div className="stat-card">
                <strong>12h+</strong>
                <span>Skin Longevity</span>
              </div>
            </div>

            <Link to="/shop" className="heritage-link">
              <span>Read The Maison Story</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. CATEGORY SHOWCASE
      ===================================================== */}
      <section className="ryox-section category-section">
        <div className="category-heading">
          <span className="category-heading-line"></span>
          <p className="category-eyebrow">CURATED FOR EVERY ESSENCE</p>
          <span className="category-heading-line"></span>
        </div>

        <h2 className="ryox-section-title">Shop by Category</h2>
        <p className="category-subtitle">
          Find the scent profile perfectly tuned to your style and presence.
        </p>

        <div className="category-grid">
          {[
            { label: 'For Him', slug: 'him', subtitle: 'Bold Woods, Spices & Smoked Vetiver', emoji: '🖤' },
            { label: 'For Her', slug: 'her', subtitle: 'Luminous Florals & Velvet Accords', emoji: '🤍' },
            { label: 'Unisex', slug: 'unisex', subtitle: 'Sensual Ambers & Fresh Citrus Accords', emoji: '✨' },
            { label: 'Gifting & Sets', slug: 'gifting', subtitle: 'Prestige Gift Boxes & Discovery Sets', emoji: '🎁' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="category-card"
            >
              <div className="category-emoji">{cat.emoji}</div>
              <h3 className="category-label">{cat.label}</h3>
              <p className="category-card-sub">{cat.subtitle}</p>
              <span className="category-explore">
                EXPLORE NOW
                <span className="category-arrow">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          5. FEATURED MASTERPIECES
      ===================================================== */}
      {featured.length > 0 && (
        <section id="featured-section" className="ryox-section product-section">
          <div className="luxury-section-heading">
            <div>
              <p className="section-eyebrow">SIGNATURE CREATIONS</p>
              <h2 className="ryox-product-section-title">Featured Fragrances</h2>
            </div>
            <Link to="/shop?featured=true" className="see-all">
              VIEW FULL COLLECTION <span>→</span>
            </Link>
          </div>

          <div className="product-grid">
            {featured.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCart={() => handleAddToCart(product)}
                onWishlist={() => handleWishlist(product)}
                inWishlist={isInWishlist(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          6. THE OLFACTORY NOTES PYRAMID MASTERCLASS
      ===================================================== */}
      <section className="ryox-section pyramid-section">
        <div className="pyramid-header">
          <span className="section-eyebrow">THE ARCHITECTURE OF SCENT</span>
          <h2 className="ryox-section-title">The Olfactory Pyramid</h2>
          <p className="category-subtitle">
            Understand how our fragrances evolve harmoniously from the first spray to the lingering dry-down.
          </p>
        </div>

        <div className="pyramid-cards-grid">
          {/* Top Notes */}
          <div className="pyramid-card">
            <div className="pyramid-icon-wrap">
              <Wind size={22} color="#bfa15f" />
            </div>
            <span className="pyramid-stage">FIRST 15–30 MINUTES</span>
            <h3 className="pyramid-layer-name">Top Notes</h3>
            <p className="pyramid-desc">
              The luminous, vibrant opening. Crisp citrus, crushed leaves, and delicate spices that greet the senses immediately upon application.
            </p>
            <div className="pyramid-accords-tags">
              <span>Calabrian Bergamot</span>
              <span>Pink Pepper</span>
              <span>Sicilian Lemon</span>
            </div>
          </div>

          {/* Heart Notes */}
          <div className="pyramid-card pyramid-card--highlight">
            <div className="pyramid-icon-wrap">
              <Droplets size={22} color="#bfa15f" />
            </div>
            <span className="pyramid-stage">2 TO 4 HOURS</span>
            <h3 className="pyramid-layer-name">Heart Notes</h3>
            <p className="pyramid-desc">
              The emotional soul of the perfume. Rich florals and exotic aromatic accords that bloom as the top notes gently diffuse.
            </p>
            <div className="pyramid-accords-tags">
              <span>Damask Rose</span>
              <span>French Jasmine</span>
              <span>Neroli Petals</span>
            </div>
          </div>

          {/* Base Notes */}
          <div className="pyramid-card">
            <div className="pyramid-icon-wrap">
              <Flame size={22} color="#bfa15f" />
            </div>
            <span className="pyramid-stage">6 TO 12+ HOURS</span>
            <h3 className="pyramid-layer-name">Base Notes</h3>
            <p className="pyramid-desc">
              The enduring memory. Deep precious woods, warm ambers, and decadent vanillas that anchor the fragrance on your skin all day.
            </p>
            <div className="pyramid-accords-tags">
              <span>Royal Amberwood</span>
              <span>Bourbon Vanilla</span>
              <span>Smoked Oud</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          7. BESTSELLERS
      ===================================================== */}
      {bestsellers.length > 0 && (
        <section className="ryox-section product-section">
          <div className="luxury-section-heading">
            <div>
              <p className="section-eyebrow">MOST COVETED</p>
              <h2 className="ryox-product-section-title">Maison Bestsellers</h2>
            </div>
            <Link to="/shop?bestseller=true" className="see-all">
              SEE ALL BESTSELLERS <span>→</span>
            </Link>
          </div>

          <div className="product-grid">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCart={() => handleAddToCart(product)}
                onWishlist={() => handleWishlist(product)}
                inWishlist={isInWishlist(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          8. NEW ARRIVALS
      ===================================================== */}
      {newArrivals.length > 0 && (
        <section className="ryox-section product-section">
          <div className="luxury-section-heading">
            <div>
              <p className="section-eyebrow">LATEST RELEASES</p>
              <h2 className="ryox-product-section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?new_arrival=true" className="see-all">
              DISCOVER NEW <span>→</span>
            </Link>
          </div>

          <div className="product-grid">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCart={() => handleAddToCart(product)}
                onWishlist={() => handleWishlist(product)}
                inWishlist={isInWishlist(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          9. CONNOISSEUR REVIEWS
      ===================================================== */}
      <section className="ryox-section testimonials-section">
        <div className="testimonials-header">
          <span className="section-eyebrow">VERIFIED EXPERIENCES</span>
          <h2 className="ryox-section-title">Fragrance Connoisseurs</h2>
          <p className="category-subtitle">
            What our distinguished patrons say about their RyOx olfactory journey.
          </p>
        </div>

        <div className="testimonials-grid">
          {[
            {
              quote: "The longevity of Royal Amberwood is extraordinary. A captivating sillage that commands compliments wherever I go.",
              author: "Aarav M.",
              role: "Verified Collector",
              rating: 5,
              scent: "Royal Amberwood Extrait",
            },
            {
              quote: "Unlike mass-market perfumes, RyOx feels authentic and artisanal. The Damask Rose blend is luminous yet grounded.",
              author: "Priya S.",
              role: "Perfume Enthusiast",
              rating: 5,
              scent: "Rose Impériale Eau De Parfum",
            },
            {
              quote: "Packaging, bottle weight, and spray atomizer are all top tier luxury. Truly feels like a bespoke Paris creation.",
              author: "Vikram R.",
              role: "Verified Patron",
              rating: 5,
              scent: "Oud Noir Signature",
            },
          ].map((item, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="#bfa15f" color="#bfa15f" />
                ))}
              </div>
              <p className="testimonial-quote">"{item.quote}"</p>
              <div className="testimonial-footer">
                <div>
                  <strong className="testimonial-author">{item.author}</strong>
                  <span className="testimonial-role">{item.role}</span>
                </div>
                <span className="testimonial-scent-tag">{item.scent}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          10. PROMOTIONAL MAISON OFFER BANNER
      ===================================================== */}
      <section className="ryox-banner">
        <div className="banner-glow"></div>
        <div className="banner-content">
          <p className="banner-eyebrow">AN EXCLUSIVE INVITATION</p>
          <h2 className="banner-title">Elevate Your Signature Scent</h2>
          <p className="banner-description">
            Complimentary doorstep delivery on orders above ₹999.
            <br />
            <span>
              Use private code <strong>RYOX10</strong> for 10% off your inaugural order.
            </span>
          </p>
          <Link to="/shop" className="ryox-banner-btn">
            SHOP THE COLLECTION <span>→</span>
          </Link>
        </div>
      </section>

      {/* =====================================================
          11. HAUTE PARFUMERIE FOOTER
      ===================================================== */}
      <footer className="luxury-footer">
        <div className="footer-statement">
          <div className="footer-glow"></div>
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
    </div>
  )
}

/* ============================================================
   PRODUCT CARD COMPONENT
============================================================ */
function ProductCard({ product, onCart, onWishlist, inWishlist }) {
  const imageUrl = getProductImage(product)
  return (
    <div className="ryox-product-card">
      <Link to={`/product/${product.slug}`} className="ryox-product-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="ryox-product-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              const fallback = e.target.parentElement.querySelector('.ryox-product-image-placeholder')
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}

        <div
          className="ryox-product-image-placeholder"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <span>🧴</span>
        </div>

        <div className="ryox-product-image-overlay"></div>

        <div className="ryox-product-badges">
          {product.is_new_arrival && (
            <span className="ryox-badge-new">NEW</span>
          )}
          {product.is_bestseller && (
            <span className="ryox-badge-best">BESTSELLER</span>
          )}
        </div>

        <button
          type="button"
          className={`ryox-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onWishlist()
          }}
          aria-label="Add to wishlist"
        >
          <Heart
            size={18}
            strokeWidth={1.7}
            fill={inWishlist ? '#bfa15f' : 'none'}
            color={inWishlist ? '#bfa15f' : '#2b2621'}
          />
        </button>

        <div className="ryox-image-action">
          <span>VIEW FRAGRANCE</span>
          <ArrowRight size={13} />
        </div>
      </Link>

      <div className="ryox-product-info">
        <p className="ryox-product-category">
          {product.category?.name || 'Eau De Parfum'}
        </p>
        <Link to={`/product/${product.slug}`} className="ryox-product-name">
          {product.name}
        </Link>
        <div className="ryox-product-bottom">
          <span className="ryox-product-price">
            {product.starting_price
              ? `₹${product.starting_price}`
              : 'Discover Price'}
          </span>
          <button
            type="button"
            className="ryox-cart-btn"
            onClick={onCart}
            aria-label="Add to bag"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage