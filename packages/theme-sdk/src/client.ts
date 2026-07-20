import {
  StorefrontConfig,
  Store,
  Product,
  Collection,
  Cart,
  AddToCartInput,
  Customer,
  Page,
  BlogPost,
  Menu,
  ThemeSettings,
  ProductQueryParams,
} from "./types.js";

export class StorefrontClient {
  private config: StorefrontConfig;

  constructor(config: StorefrontConfig) {
    this.config = {
      endpointUrl: config.endpointUrl.replace(/\/$/, ""),
      merchantId: config.merchantId,
      storeId: config.storeId,
      themeVersion: config.themeVersion || "1.0.0",
      visitorSessionId: config.visitorSessionId || "anonymous",
      apiKey: config.apiKey,
    };
  }

  private async fetchStorefront<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.endpointUrl}${path.startsWith("/") ? path : `/${path}`}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-merchant-id": this.config.merchantId,
      "x-store-id": this.config.storeId,
      "x-theme-version": this.config.themeVersion || "1.0.0",
      "x-visitor-session": this.config.visitorSessionId || "anon",
      ...(options.headers as Record<string, string>),
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown storefront API error");
      throw new Error(`Storefront API Error [${res.status}]: ${errorText}`);
    }

    return res.json() as Promise<T>;
  }

  // 1. Store Details
  async getStore(): Promise<Store> {
    return this.fetchStorefront<Store>("/store/info");
  }

  // 2. Theme Settings
  async getSettings(): Promise<ThemeSettings> {
    return this.fetchStorefront<ThemeSettings>("/theme/settings");
  }

  // 3. Products & Search
  async getProducts(params: ProductQueryParams = {}): Promise<{ products: Product[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.set("category", params.category);
    if (params.collectionId) queryParams.set("collection", params.collectionId);
    if (params.query) queryParams.set("q", params.query);
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.page) queryParams.set("page", params.page.toString());

    const queryString = queryParams.toString();
    return this.fetchStorefront<{ products: Product[]; total: number }>(`/products${queryString ? `?${queryString}` : ""}`);
  }

  async getProduct(handleOrId: string): Promise<Product> {
    return this.fetchStorefront<Product>(`/products/${encodeURIComponent(handleOrId)}`);
  }

  async searchProducts(query: string, filters: Record<string, any> = {}): Promise<Product[]> {
    const result = await this.getProducts({ query, ...filters });
    return result.products;
  }

  // 4. Collections
  async getCollections(): Promise<Collection[]> {
    return this.fetchStorefront<Collection[]>("/collections");
  }

  async getCollection(handleOrId: string): Promise<Collection & { products: Product[] }> {
    return this.fetchStorefront<Collection & { products: Product[] }>(`/collections/${encodeURIComponent(handleOrId)}`);
  }

  // 5. Cart Management
  async getCart(): Promise<Cart> {
    return this.fetchStorefront<Cart>("/cart");
  }

  async addToCart(input: AddToCartInput): Promise<Cart> {
    return this.fetchStorefront<Cart>("/cart/add", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async removeFromCart(lineId: string): Promise<Cart> {
    return this.fetchStorefront<Cart>(`/cart/line/${encodeURIComponent(lineId)}`, {
      method: "DELETE",
    });
  }

  async updateCart(lineId: string, quantity: number): Promise<Cart> {
    return this.fetchStorefront<Cart>(`/cart/line/${encodeURIComponent(lineId)}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  }

  // 6. Checkout Creation
  async createCheckout(): Promise<{ checkoutUrl: string; orderId: string }> {
    return this.fetchStorefront<{ checkoutUrl: string; orderId: string }>("/checkout/initiate", {
      method: "POST",
    });
  }

  // 7. Customer Profile
  async getCustomer(): Promise<Customer | null> {
    try {
      return await this.fetchStorefront<Customer>("/customer/me");
    } catch {
      return null;
    }
  }

  // 8. Navigation Menus
  async getMenu(handle: string): Promise<Menu> {
    return this.fetchStorefront<Menu>(`/menus/${encodeURIComponent(handle)}`);
  }

  // 9. Pages & Blogs
  async getPages(): Promise<Page[]> {
    return this.fetchStorefront<Page[]>("/pages");
  }

  async getBlogs(): Promise<BlogPost[]> {
    return this.fetchStorefront<BlogPost[]>("/blogs");
  }
}
