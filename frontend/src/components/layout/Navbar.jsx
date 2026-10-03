import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import toast from 'react-hot-toast'
import NotificationBell from '../ui/NotificationBell'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()

  const { isAuthenticated, logout } = useAuthStore()
  const { totalItems } = useCartStore()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
      setSearch('')
    }
  }

  return (
    <nav style={styles.nav}>
      {/* Luxury glow accent */}
      <div style={styles.navGlow}></div>

      {/* LOGO */}
      <Link to="/" style={styles.logo}>
        <img
          src="/image/ryox-logo.png"
          alt="RYOX"
          style={styles.logoImage}
        />
      </Link>

      {/* DESKTOP LINKS */}
      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/shop" style={styles.link}>
          Collection
        </Link>
        <Link to="/shop?category=him" style={styles.link}>
          For Him
        </Link>
        <Link to="/shop?category=her" style={styles.link}>
          For Her
        </Link>
      </div>

      {/* RIGHT ICONS */}
      <div style={styles.icons}>
        {/* SEARCH */}
        <button
          style={styles.iconBtn}
          onClick={() => setSearchOpen(!searchOpen)}
          title="Search"
          aria-label="Search"
        >
          <Search size={19} strokeWidth={1.8} color="#2b2621" />
        </button>

        {/* WISHLIST */}
        {isAuthenticated && (
          <Link
            to="/wishlist"
            style={styles.iconBtn}
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart size={19} strokeWidth={1.8} color="#2b2621" />
          </Link>
        )}

        {/* NOTIFICATIONS */}
        <div style={styles.notificationWrapper}>
          <NotificationBell />
        </div>

        {/* CART */}
        <Link
          to="/cart"
          style={styles.iconBtnRelative}
          title="Shopping Bag"
          aria-label="Shopping Bag"
        >
          <ShoppingBag size={19} strokeWidth={1.8} color="#2b2621" />
          {totalItems > 0 && (
            <span style={styles.badge}>
              {totalItems}
            </span>
          )}
        </Link>

        {/* USER */}
        {isAuthenticated ? (
          <div style={styles.userMenu}>
            <Link
              to="/profile"
              style={styles.iconBtn}
              title="My Profile"
              aria-label="Profile"
            >
              <User size={19} strokeWidth={1.8} color="#2b2621" />
            </Link>
            <button
              style={styles.iconBtn}
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={19} strokeWidth={1.8} color="#9c4238" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={styles.loginBtn}
            title="Sign In"
          >
            <User size={16} strokeWidth={1.8} />
            <span>Sign In</span>
          </Link>
        )}

        {/* MOBILE MENU TOGGLE */}
        <button
          style={styles.mobileMenuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          title="Menu"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={22} color="#1a1714" /> : <Menu size={22} color="#1a1714" />}
        </button>
      </div>

      {/* SEARCH DROPDOWN MODAL */}
      {searchOpen && (
        <div style={styles.searchBar}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <Search size={18} color="#bfa15f" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search rare fragrances, notes, or collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />
            <button type="submit" style={styles.searchBtn}>
              EXPLORE
            </button>
          </form>
        </div>
      )}

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link
            to="/"
            style={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/shop"
            style={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            Collection
          </Link>
          <Link
            to="/shop?category=him"
            style={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            For Him
          </Link>
          <Link
            to="/shop?category=her"
            style={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            For Her
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link
                to="/wishlist"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                Wishlist
              </Link>
              <button
                style={styles.mobileLinkBtn}
                onClick={() => { setMenuOpen(false); handleLogout(); }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: '76px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2.5rem',
    background: 'rgba(253, 251, 247, 0.94)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(191, 161, 95, 0.22)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease',
  },

  navGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '-1px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(191, 161, 95, 0.5), transparent)',
    pointerEvents: 'none',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    height: '56px',
    textDecoration: 'none',
    position: 'relative',
    zIndex: 2,
  },

  logoImage: {
    height: '58px',
    width: '160px',
    objectFit: 'contain',
    display: 'block',
    filter: 'drop-shadow(0 2px 8px rgba(191, 161, 95, 0.15))',
    transition: 'transform 0.35s ease',
  },

  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
    marginLeft: 'auto',
    marginRight: '2.5rem',
  },

  link: {
    position: 'relative',
    color: '#38322c',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '24px 0',
    transition: 'color 0.25s ease',
  },

  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },

  iconBtn: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'none',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.25s ease',
  },

  iconBtnRelative: {
    position: 'relative',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '50%',
    textDecoration: 'none',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.25s ease',
  },

  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    padding: '0.55rem 1.1rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    boxShadow: '0 4px 12px rgba(191, 161, 95, 0.25)',
    transition: 'all 0.3s ease',
  },

  badge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    borderRadius: '50%',
    minWidth: '17px',
    height: '17px',
    padding: '0 4px',
    fontSize: '0.62rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    border: '2px solid #fdfbf7',
    boxShadow: '0 2px 6px rgba(191, 161, 95, 0.35)',
  },

  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
    paddingLeft: '0.6rem',
  },

  notificationWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mobileMenuBtn: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem',
  },

  searchBar: {
    position: 'absolute',
    top: '76px',
    left: 0,
    right: 0,
    padding: '1.2rem 2.5rem',
    background: 'rgba(255, 255, 255, 0.98)',
    borderBottom: '1px solid rgba(191, 161, 95, 0.25)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(16px)',
  },

  searchForm: {
    maxWidth: '750px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    position: 'relative',
  },

  searchIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },

  searchInput: {
    flex: 1,
    padding: '0.85rem 1rem 0.85rem 2.8rem',
    background: '#f7f4ed',
    border: '1px solid rgba(191, 161, 95, 0.3)',
    borderRadius: '6px',
    color: '#1a1714',
    fontSize: '0.9rem',
    outline: 'none',
  },

  searchBtn: {
    padding: '0.85rem 1.6rem',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '1.5px',
  },

  mobileMenu: {
    position: 'absolute',
    top: '76px',
    left: 0,
    right: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 2rem 2rem',
    background: '#ffffff',
    borderBottom: '1px solid rgba(191, 161, 95, 0.25)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
  },

  mobileLink: {
    color: '#2d2824',
    fontSize: '0.9rem',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },

  mobileLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#9c4238',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    textAlign: 'left',
    padding: '1rem 0',
  },
}

export default Navbar