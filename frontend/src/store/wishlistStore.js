import { create } from 'zustand'
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist'

const useWishlistStore = create((set, get) => ({
  wishlist:   null,
  totalItems: 0,
  loading:    false,

  // fetch wishlist
  fetchWishlist: async () => {
    set({ loading: true })
    try {
      const res = await getWishlist()
      set({
        wishlist:   res.data,
        totalItems: res.data.total_items,
        loading:    false,
      })
    } catch {
      set({ loading: false })
    }
  },

  // add to wishlist
  addItem: async (productId) => {
    try {
      const res = await addToWishlist({ product_id: productId })
      set({
        wishlist:   res.data,
        totalItems: res.data.total_items,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed' }
    }
  },

  // remove from wishlist
  removeItem: async (itemId) => {
    try {
      await removeFromWishlist(itemId)
      await get().fetchWishlist()
      return { success: true }
    } catch {
      return { success: false }
    }
  },

  // check if product is in wishlist
  isInWishlist: (productId) => {
    const { wishlist } = get()
    if (!wishlist) return false
    return wishlist.items.some((item) => item.product.id === productId)
  },
}))

export default useWishlistStore