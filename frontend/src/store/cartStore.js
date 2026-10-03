import { create } from 'zustand'
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '../api/cart'

const useCartStore = create((set, get) => ({
  cart:        null,
  totalItems:  0,
  totalPrice:  0,
  loading:     false,

  // fetch cart from backend
  fetchCart: async () => {
    set({ loading: true })
    try {
      const res = await getCart()
      set({
        cart:       res.data,
        totalItems: res.data.total_items,
        totalPrice: res.data.total_price,
        loading:    false,
      })
    } catch {
      set({ loading: false })
    }
  },

  // add item to cart
  addItem: async (variantId, quantity = 1) => {
    try {
      const res = await addToCart({ variant_id: variantId, quantity })
      set({
        cart:       res.data,
        totalItems: res.data.total_items,
        totalPrice: res.data.total_price,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add' }
    }
  },

  // update quantity
  updateItem: async (itemId, quantity) => {
    try {
      await updateCart(itemId, { quantity })
      await get().fetchCart()
      return { success: true }
    } catch {
      return { success: false }
    }
  },

  // remove item
  removeItem: async (itemId) => {
    try {
      await removeFromCart(itemId)
      await get().fetchCart()
      return { success: true }
    } catch {
      return { success: false }
    }
  },

  // clear cart
  clearCart: async () => {
    try {
      await clearCart()
      set({ cart: null, totalItems: 0, totalPrice: 0 })
    } catch {}
  },
}))

export default useCartStore