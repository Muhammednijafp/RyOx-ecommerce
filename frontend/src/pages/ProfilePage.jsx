import { useEffect, useState } from 'react'
import { getProfile, updateProfile, getAddresses, addAddress, deleteAddress } from '../api/auth'
import { User, MapPin, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { Link } from 'react-router-dom'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [editing, setEditing] = useState(false)
  const [addingAddr, setAddingAddr] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [newAddr, setNewAddr] = useState({
    full_name: '', phone: '', address_line: '',
    city: '', state: '', pincode: '', is_default: false
  })

  const { logout } = useAuthStore()

  useEffect(() => {
    loadData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const loadData = async () => {
    try {
      const [profRes, addrRes] = await Promise.all([getProfile(), getAddresses()])
      setProfile(profRes.data)
      setAddresses(addrRes.data)
      setForm({ full_name: profRes.data.full_name, phone: profRes.data.phone })
    } catch {
      toast.error('Failed to load profile')
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile(form)
      setProfile(res.data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
    setSaving(false)
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const cleanPhone = (newAddr.phone || '').replace(/\D/g, '').slice(-10)
      const cleanPin = (newAddr.pincode || '').replace(/\D/g, '')

      await addAddress({
        ...newAddr,
        phone: cleanPhone,
        pincode: cleanPin,
      })
      toast.success('Address added!')
      setAddingAddr(false)
      setNewAddr({
        full_name: '', phone: '', address_line: '',
        city: '', state: '', pincode: '', is_default: false
      })
      const res = await getAddresses()
      setAddresses(res.data)
    } catch (err) {
      const errors = err.response?.data
      if (errors && typeof errors === 'object') {
        Object.values(errors).forEach((msg) => {
          if (Array.isArray(msg)) msg.forEach((m) => toast.error(m))
          else toast.error(String(msg))
        })
      } else {
        toast.error('Failed to add address')
      }
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return
    try {
      await deleteAddress(id)
      toast.success('Address deleted')
      setAddresses(addresses.filter((a) => a.id !== id))
    } catch {
      toast.error('Failed to delete address')
    }
  }

  if (loading) return <div style={styles.loading}>Loading profile...</div>

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.avatarBox}>
          <div style={styles.avatar}>
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <p style={styles.avatarName}>{profile?.full_name}</p>
          <p style={styles.avatarEmail}>{profile?.email}</p>
        </div>

        <nav style={styles.nav}>
          {[
            { key: 'profile', label: '👤 My Profile' },
            { key: 'addresses', label: '📍 Addresses' },
          ].map((item) => (
            <button
              key={item.key}
              style={activeTab === item.key ? styles.navBtnActive : styles.navBtn}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
          <Link to="/orders" style={styles.navBtn}>📦 My Orders</Link>
          <Link to="/wishlist" style={styles.navBtn}>❤️ Wishlist</Link>
          <button style={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                <User size={18} color="var(--ryox-gold-dark)" /> Personal Information
              </h2>
              {!editing && (
                <button style={styles.editBtn} onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formBtns}>
                  <button type="submit" style={styles.saveBtn} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" style={styles.cancelBtn} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.infoGrid}>
                {[
                  { label: 'Full Name', value: profile?.full_name },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone || 'Not added' },
                  { label: 'Member Since', value: new Date(profile?.date_joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
                ].map((item) => (
                  <div key={item.label} style={styles.infoItem}>
                    <p style={styles.infoLabel}>{item.label}</p>
                    <p style={styles.infoValue}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                <MapPin size={18} color="var(--ryox-gold-dark)" /> Saved Addresses
              </h2>
              <button style={styles.editBtn} onClick={() => setAddingAddr(true)}>
                <Plus size={14} /> Add New
              </button>
            </div>

            {/* Add Address Form */}
            {addingAddr && (
              <form onSubmit={handleAddAddress} style={styles.addrForm}>
                <div style={styles.formGrid}>
                  {[
                    { key: 'full_name', label: 'Full Name' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'address_line', label: 'Address Line' },
                    { key: 'city', label: 'City' },
                    { key: 'state', label: 'State' },
                    { key: 'pincode', label: 'Pincode' },
                  ].map((field) => (
                    <div key={field.key} style={styles.field}>
                      <label style={styles.label}>{field.label}</label>
                      <input
                        type="text"
                        value={newAddr[field.key]}
                        onChange={(e) => setNewAddr({ ...newAddr, [field.key]: e.target.value })}
                        style={styles.input}
                        required
                      />
                    </div>
                  ))}
                </div>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newAddr.is_default}
                    onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                  />
                  <span style={{ color: 'var(--ryox-text-muted)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>Set as default</span>
                </label>
                <div style={styles.formBtns}>
                  <button type="submit" style={styles.saveBtn}>Save Address</button>
                  <button type="button" style={styles.cancelBtn} onClick={() => setAddingAddr(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 && !addingAddr ? (
              <p style={styles.noData}>No saved addresses yet.</p>
            ) : (
              <div style={styles.addrList}>
                {addresses.map((addr) => (
                  <div key={addr.id} style={styles.addrCard}>
                    <div style={styles.addrInfo}>
                      <div style={styles.addrTop}>
                        <p style={styles.addrName}>{addr.full_name}</p>
                        {addr.is_default && (
                          <span style={styles.defaultBadge}>Default</span>
                        )}
                      </div>
                      <p style={styles.addrText}>{addr.address_line}</p>
                      <p style={styles.addrText}>
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p style={styles.addrText}>📞 {addr.phone}</p>
                    </div>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: 'var(--ryox-bg)', minHeight: '100vh', display: 'flex', gap: '2.5rem', padding: '3rem 2rem 5rem', maxWidth: '1240px', margin: '0 auto', flexWrap: 'wrap' },
  loading: { color: 'var(--ryox-text-muted)', textAlign: 'center', padding: '6rem', fontSize: '1.1rem' },

  sidebar: { width: '260px', flexShrink: 0 },
  avatarBox: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '1.8rem', textAlign: 'center', marginBottom: '1.2rem', boxShadow: 'var(--ryox-shadow-sm)' },
  avatar: {
    width: '68px', height: '68px', borderRadius: '50%',
    background: 'var(--ryox-gold-gradient)', color: '#14120e',
    fontSize: '1.8rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '0 4px 15px rgba(191,161,95,0.3)',
  },
  avatarName: { color: 'var(--ryox-text-heading)', fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.3rem' },
  avatarEmail: { color: 'var(--ryox-text-muted)', fontSize: '0.82rem' },

  nav: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', boxShadow: 'var(--ryox-shadow-sm)' },
  navBtn: { backgroundColor: 'transparent', border: 'none', color: 'var(--ryox-text-muted)', padding: '0.8rem 1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', textDecoration: 'none', display: 'block', fontWeight: '500', transition: 'all 0.2s ease' },
  navBtnActive: { backgroundColor: 'rgba(191,161,95,0.12)', border: 'none', color: 'var(--ryox-gold-dark)', padding: '0.8rem 1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', fontWeight: '700' },
  logoutBtn: { backgroundColor: 'transparent', border: 'none', color: '#dc2626', padding: '0.8rem 1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '600' },

  main: { flex: 1, minWidth: '320px' },
  card: { backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--ryox-shadow-sm)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', paddingBottom: '1rem', borderBottom: '1px solid var(--ryox-divider)' },
  cardTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 },
  editBtn: {
    backgroundColor: 'transparent', border: '1px solid var(--ryox-gold-border)',
    color: 'var(--ryox-gold-dark)', padding: '0.45rem 1.1rem', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem',
  },

  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.8rem' },
  infoItem: {},
  infoLabel: { color: 'var(--ryox-text-muted)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: '600' },
  infoValue: { color: 'var(--ryox-text-heading)', fontSize: '1rem', fontWeight: '600' },

  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '0.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: 'var(--ryox-text-heading)', fontSize: '0.82rem', fontWeight: '600' },
  input: {
    padding: '0.75rem 1rem', backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)', borderRadius: '8px',
    color: 'var(--ryox-text-heading)', fontSize: '0.92rem', outline: 'none',
  },
  formBtns: { display: 'flex', gap: '0.8rem', marginTop: '0.5rem' },
  saveBtn: { padding: '0.8rem 1.6rem', background: 'var(--ryox-gold-gradient)', color: '#14120e', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' },
  cancelBtn: { padding: '0.8rem 1.4rem', backgroundColor: 'transparent', color: 'var(--ryox-text-muted)', border: '1px solid var(--ryox-divider)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '0.5rem' },

  addrForm: { backgroundColor: 'var(--ryox-surface-subtle)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.8rem', border: '1px solid var(--ryox-divider)' },
  addrList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  addrCard: { backgroundColor: 'var(--ryox-surface-subtle)', border: '1px solid var(--ryox-divider)', borderRadius: '12px', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  addrInfo: { flex: 1 },
  addrTop: { display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' },
  addrName: { color: 'var(--ryox-text-heading)', fontWeight: '600', fontSize: '0.98rem' },
  defaultBadge: { backgroundColor: 'rgba(46,125,50,0.1)', color: '#2e7d32', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '700' },
  addrText: { color: 'var(--ryox-text-muted)', fontSize: '0.88rem', marginBottom: '0.2rem' },
  deleteBtn: { backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.3rem' },
  noData: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' },
}

export default ProfilePage