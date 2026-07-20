export interface StorefrontConfig {
  merchantId: string;
  storeId: string;
  endpointUrl: string;
  themeVersion?: string;
  visitorSessionId?: string;
  apiKey?: string;
}

export interface Store {
  id: string;
  name: string;
  domain: string;
  currency: string;
  logoUrl?: string;
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface ProductVariant {
  id: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  sku?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  status: "active" | "draft";
  images: string[];
  category: string;
  tags?: string[];
  vendor?: string;
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  imageUrl?: string;
  productsCount: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  total: number;
  couponCode?: string;
}

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  ordersCount: number;
}

export interface Page {
  id: string;
  title: string;
  handle: string;
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  handle: string;
  author: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl?: string;
  publishedAt: string;
  tags?: string[];
}

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: "url" | "product" | "collection" | "page" | "blog";
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  handle: string;
  title: string;
  items: MenuItem[];
}

export interface ThemeSettings {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBg: string;
  colorText: string;
  fontHeading: string;
  fontBody: string;
  buttonRadius: string;
  containerWidth: string;
  enableAnnouncement: boolean;
  announcementText: string;
  stickyHeader: boolean;
  enableSearch: boolean;
  enableWishlist: boolean;
  enableQuickView: boolean;
  [key: string]: any;
}

export interface ProductQueryParams {
  category?: string;
  collectionId?: string;
  query?: string;
  sort?: "price-asc" | "price-desc" | "created-desc" | "bestselling";
  limit?: number;
  page?: number;
}
