export const routes = {
  home: "/",
  products: "/products",
  cart: "/cart",
  checkout: "/checkout",
  login: "/login",
  register: "/register",
  account: "/account",
  search: "/search",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminOrders: "/admin/orders",
} as const;

export function getProductDetailPath(slug: string) {
  return `/products/${slug}`;
}

export function getCategoryDetailPath(slug: string) {
  return `/categories/${slug}`;
}