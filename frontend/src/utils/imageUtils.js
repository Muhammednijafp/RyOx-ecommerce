// Utility to resolve full backend media URLs for product images

const getBackendBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL
  if (envApiUrl) {
    return envApiUrl.replace(/\/api\/?$/, '')
  }
  return 'http://127.0.0.1:8000'
}

export const getMediaUrl = (url) => {
  if (!url) return null
  if (typeof url === 'object') {
    url = url.image || url.url || url.file || url.primary_image || null
  }
  if (!url || typeof url !== 'string') return null

  // If already absolute URL or data URI, return as-is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }

  // Prepend backend base URL to relative media path
  const backendHost = getBackendBaseUrl()
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${backendHost}${cleanPath}`
}

export const getProductImage = (item) => {
  if (!item) return null

  // If passed directly as a string or media object
  if (typeof item === 'string') return getMediaUrl(item)

  // Direct property lookups across all potential models & nested structures
  const raw =
    item.primary_image ||
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0
      ? (typeof item.images[0] === 'object' ? item.images[0].image || item.images[0].url : item.images[0])
      : null) ||
    item.product?.primary_image ||
    item.product?.image ||
    (Array.isArray(item.product?.images) && item.product.images.length > 0
      ? (typeof item.product.images[0] === 'object' ? item.product.images[0].image || item.product.images[0].url : item.product.images[0])
      : null) ||
    item.variant?.product?.primary_image ||
    item.variant?.product?.image ||
    (Array.isArray(item.variant?.product?.images) && item.variant.product.images.length > 0
      ? (typeof item.variant.product.images[0] === 'object' ? item.variant.product.images[0].image || item.variant.product.images[0].url : item.variant.product.images[0])
      : null) ||
    item.thumbnail ||
    null

  return getMediaUrl(raw)
}
