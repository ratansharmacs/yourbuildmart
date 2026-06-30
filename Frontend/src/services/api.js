// ─── YourBuildMart API Service ────────────────────────────────────────────────
// In development: frontend is on :5173, backend is on :8080
// In production:  both are served from the same domain (yourbuildmart.com)
// BASE_URL is empty string in production so /uploads/... resolves to the same origin.

const isDev = import.meta.env.DEV;  // true when running via `vite dev`, false after build

export const BASE_URL = isDev
  ? (import.meta.env.VITE_API_URL || "http://localhost:8080")
  : (import.meta.env.VITE_API_URL || "");  // empty = same origin in production

/**
 * Converts a relative image path stored in the DB (e.g. /uploads/products/1/abc.jpg)
 * into a full URL the browser can fetch.  Absolute URLs (http/https) are returned as-is.
 */
export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // relative path from backend — prepend backend origin
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("ybm_token");
export const getRefreshToken = () => localStorage.getItem("ybm_refresh_token");
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("ybm_token", accessToken);
  if (refreshToken) localStorage.setItem("ybm_refresh_token", refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem("ybm_token");
  localStorage.removeItem("ybm_refresh_token");
  localStorage.removeItem("ybm_user");
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const method = options.method || "GET";
  console.log(`[API] ▶ ${method} ${path}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    console.warn(`[API] ⚠ 401 on ${method} ${path} — attempting token refresh`);
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retried = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      console.log(`[API]   Retry ${method} ${path} → ${retried.status}`);
      return retried;
    }
    console.error(`[API] ✖ Token refresh failed — user will need to log in`);
  }

  console.log(`[API] ← ${res.status} ${method} ${path}`);
  return res;
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    if (res.ok) {
      const data = await res.json();
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
  } catch (_) {}
  clearTokens();
  return false;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `Error ${res.status}`;
    console.error(`[API] ✖ Response error ${res.status} — ${msg}`, data);
    throw new Error(msg);
  }
  console.log(`[API] ✅ Response ok ${res.status}`, data);
  return data?.data ?? data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("ybm_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
    return data;
  },

  register: async ({ firstName, lastName, email, password, phone }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, phone: phone || "+910000000000" }),
    });
    const data = await handleResponse(res);
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("ybm_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
    return data;
  },

  logout: async () => {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch (_) {}
    clearTokens();
  },

  getUser: () => {
    try { return JSON.parse(localStorage.getItem("ybm_user")); } catch { return null; }
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: async ({ page = 0, size = 20, sortBy = "createdAt", direction = "desc" } = {}) => {
    const res = await apiFetch(`/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await apiFetch(`/products/${id}`);
    return handleResponse(res);
  },
  getByCategory: async (categoryId, { page = 0, size = 20 } = {}) => {
    const res = await apiFetch(`/products/category/${categoryId}?page=${page}&size=${size}`);
    return handleResponse(res);
  },
  getByBrand: async (brand, { page = 0, size = 20 } = {}) => {
    const res = await apiFetch(`/products/brand/${encodeURIComponent(brand)}?page=${page}&size=${size}`);
    return handleResponse(res);
  },
  getFeatured: async ({ page = 0, size = 10 } = {}) => {
    const res = await apiFetch(`/products/featured?page=${page}&size=${size}`);
    return handleResponse(res);
  },
  search: async (q, { page = 0, size = 20 } = {}) => {
    const res = await apiFetch(`/products/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
    return handleResponse(res);
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: async () => {
    const res = await apiFetch("/categories");
    return handleResponse(res);
  },
  getRoots: async () => {
    const res = await apiFetch("/categories/root");
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await apiFetch(`/categories/${id}`);
    return handleResponse(res);
  },
};

// ─── CART ─────────────────────────────────────────────────────────────────────
export const cartApi = {
  getCart: async () => {
    const res = await apiFetch("/cart");
    return handleResponse(res);
  },
  addItem: async (productId, quantity = 1) => {
    const res = await apiFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(res);
  },
  updateItem: async (cartItemId, quantity) => {
    const res = await apiFetch(`/cart/items/${cartItemId}?quantity=${quantity}`, { method: "PUT" });
    return handleResponse(res);
  },
  removeItem: async (cartItemId) => {
    const res = await apiFetch(`/cart/items/${cartItemId}`, { method: "DELETE" });
    return handleResponse(res);
  },
  clearCart: async () => {
    const res = await apiFetch("/cart", { method: "DELETE" });
    return handleResponse(res);
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  placeOrder: async ({ name, email, organization, country, phone, enquiry }) => {
    const res = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({ name, email, organization, country, phone, enquiry }),
    });
    return handleResponse(res);
  },
  getMyOrders: async ({ page = 0, size = 10 } = {}) => {
    const res = await apiFetch(`/orders?page=${page}&size=${size}`);
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await apiFetch(`/orders/${id}`);
    return handleResponse(res);
  },
  cancelOrder: async (id) => {
    const res = await apiFetch(`/orders/${id}/cancel`, { method: "PATCH" });
    return handleResponse(res);
  },
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  getWishlist: async ({ page = 0, size = 20 } = {}) => {
    const res = await apiFetch(`/wishlist?page=${page}&size=${size}`);
    return handleResponse(res);
  },
  toggle: async (productId) => {
    const res = await apiFetch(`/wishlist/toggle/${productId}`, { method: "POST" });
    return handleResponse(res);
  },
  check: async (productId) => {
    const res = await apiFetch(`/wishlist/check/${productId}`);
    const data = await handleResponse(res);
    // Backend returns a raw boolean wrapped in ApiResponse.data
    return typeof data === "boolean" ? data : !!data;
  },
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: async () => {
    const res = await apiFetch("/users/me");
    return handleResponse(res);
  },
  updateProfile: async ({ firstName, lastName, phone }) => {
    const res = await apiFetch("/users/me", {
      method: "PUT",
      body: JSON.stringify({ firstName, lastName, phone }),
    });
    return handleResponse(res);
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await apiFetch("/users/me/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },
};

// ─── ADDRESSES ────────────────────────────────────────────────────────────────
export const addressApi = {
  getAll: async () => {
    const res = await apiFetch("/addresses");
    return handleResponse(res);
  },
  create: async (address) => {
    const res = await apiFetch("/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
    return handleResponse(res);
  },
  update: async (id, address) => {
    const res = await apiFetch(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(address),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await apiFetch(`/addresses/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
  setDefault: async (id) => {
    const res = await apiFetch(`/addresses/${id}/default`, { method: "PATCH" });
    return handleResponse(res);
  },
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getByProduct: async (productId, { page = 0, size = 10 } = {}) => {
    const res = await apiFetch(`/reviews/product/${productId}?page=${page}&size=${size}`);
    return handleResponse(res);
  },
  create: async ({ productId, rating, comment }) => {
    const res = await apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify({ productId, rating, comment }),
    });
    return handleResponse(res);
  },
};

// ─── BRANDS ───────────────────────────────────────────────────────────────────
export const brandsApi = {
  getAll: async () => {
    const res = await apiFetch("/brands");
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await apiFetch(`/brands/${id}`);
    return handleResponse(res);
  },
};

// ─── BLOG ─────────────────────────────────────────────────────────────────────
export const blogApi = {
  getCategories: async () => {
    const res = await apiFetch("/blog/categories");
    return handleResponse(res);
  },
  createCategory: async ({ name }) => {
    const res = await apiFetch("/blog/categories", { method: "POST", body: JSON.stringify({ name }) });
    return handleResponse(res);
  },
  updateCategory: async (id, { name }) => {
    const res = await apiFetch(`/blog/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
    return handleResponse(res);
  },
  deleteCategory: async (id) => {
    const res = await apiFetch(`/blog/categories/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
  getPosts: async ({ all = false } = {}) => {
    const res = await apiFetch(`/blog/posts${all ? "?all=true" : ""}`);
    return handleResponse(res);
  },
  getPostById: async (id) => {
    const res = await apiFetch(`/blog/posts/${id}`);
    return handleResponse(res);
  },
  getPostBySlug: async (slug) => {
    const res = await apiFetch(`/blog/posts/slug/${slug}`);
    return handleResponse(res);
  },
  createPost: async (data, bannerFile, metaImageFile) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (bannerFile)    fd.append("banner",    bannerFile);
    if (metaImageFile) fd.append("metaImage", metaImageFile);
    const res = await fetch(`${BASE_URL}/blog/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return handleResponse(res);
  },
  updatePost: async (id, data, bannerFile, metaImageFile) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (bannerFile)    fd.append("banner",    bannerFile);
    if (metaImageFile) fd.append("metaImage", metaImageFile);
    const res = await fetch(`${BASE_URL}/blog/posts/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return handleResponse(res);
  },
  deletePost: async (id) => {
    const res = await apiFetch(`/blog/posts/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
  togglePublished: async (id) => {
    const res = await apiFetch(`/blog/posts/${id}/toggle`, { method: "PATCH" });
    return handleResponse(res);
  },
};

// ─── REQUESTS (Agent & Contact inquiries) ─────────────────────────────────────
export const requestsApi = {
  // Public
  submitAgent: async (data) => {
    const res = await apiFetch("/requests/agent", { method: "POST", body: JSON.stringify(data) });
    return handleResponse(res);
  },
  submitContact: async (data) => {
    const res = await apiFetch("/requests/contact", { method: "POST", body: JSON.stringify(data) });
    return handleResponse(res);
  },
  // Authenticated user
  getMyRequests: async () => {
    const res = await apiFetch("/requests/my");
    return handleResponse(res);
  },
  // Admin
  adminGetAll: async ({ page = 0, size = 20, type } = {}) => {
    const q = type ? `&type=${type}` : "";
    const res = await apiFetch(`/admin/requests?page=${page}&size=${size}${q}`);
    return handleResponse(res);
  },
  adminReply: async (id, reply) => {
    const res = await apiFetch(`/admin/requests/${id}/reply`, { method: "POST", body: JSON.stringify({ reply }) });
    return handleResponse(res);
  },
  adminDiscard: async (id) => {
    const res = await apiFetch(`/admin/requests/${id}/discard`, { method: "PATCH" });
    return handleResponse(res);
  },
};

// ─── SITE IMAGES (Website Setup → Images) ──────────────────────────────────
export const siteImagesApi = {
  // Public: one bulk call, grouped by page — used by SiteImagesProvider on app load
  getAll: async () => {
    const res = await apiFetch("/site-images");
    return handleResponse(res);
  },
  // Admin: flat list with ids, for the management table
  getAllAdmin: async () => {
    const res = await apiFetch("/admin/site-images");
    return handleResponse(res);
  },
  updateUrl: async (id, imageUrl) => {
    const res = await apiFetch(`/admin/site-images/${id}`, {
      method: "PUT",
      body: JSON.stringify({ imageUrl }),
    });
    return handleResponse(res);
  },
  upload: async (id, file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE_URL}/admin/site-images/${id}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return handleResponse(res);
  },
};

// ─── BROCHURE ─────────────────────────────────────────────────────────────────
export const brochureApi = {
  /**
   * Upload or replace a product brochure (PDF/DOC/DOCX).
   * @param {number} productId
   * @param {File} file
   */
  upload: async (productId, file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("brochure", file);
    const res = await fetch(`${BASE_URL}/products/${productId}/images/brochure`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return handleResponse(res);
  },

  /**
   * Delete the brochure for a product (admin).
   */
  delete: async (productId) => {
    const res = await apiFetch(`/products/${productId}/images/brochure`, { method: "DELETE" });
    return handleResponse(res);
  },
};
