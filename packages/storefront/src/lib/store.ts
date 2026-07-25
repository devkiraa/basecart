const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface StorefrontProduct {
  id: string;
  tenantId?: string;
  name: string;
  desc: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number;
  inStock?: boolean;
  category?: string;
  categorySlug?: string;
  imageUrl: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: Array<{ author: string; rating: number; date: string; title?: string; comment?: string; body?: string }>;
}

// Database lookup helper for storefront store information
export async function getTenantStoreData(tenant: string) {
  try {
    const res = await fetch(`${API_URL}/store/${tenant}/info`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.tenantId || data.id || tenant,
        name: data.storeName || data.name || `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Store`,
        customDomain: data.customDomain || "",
        description: data.description || "Welcome to our Basecart automated checkout storefront.",
        logoUrl: data.logoUrl || data.branding?.logoUrl || "https://basecart.app/icon.svg",
      };
    }
  } catch (err) {
    console.error(`Failed fetching store info for ${tenant}:`, err);
  }

  return {
    id: tenant,
    name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Store`,
    description: "Welcome to our Basecart automated checkout storefront.",
    logoUrl: "https://basecart.app/icon.svg",
  };
}

// Real-time Database lookup helper for tenant products
export async function getTenantProducts(tenantId: string): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(`${API_URL}/store/${tenantId}/products`, { next: { revalidate: 30 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((prod: any) => {
          let imgs: string[] = [];
          if (Array.isArray(prod.images)) {
            imgs = prod.images;
          } else if (typeof prod.images === "string" && prod.images) {
            try {
              imgs = JSON.parse(prod.images);
            } catch (e) {}
          }

          const primaryImage = imgs && imgs.length > 0 ? imgs[0] : "/basecart_storefront_mockup.png";

          return {
            id: prod.productId || prod.id,
            tenantId,
            name: prod.name,
            desc: prod.description || "",
            description: prod.description || "",
            price: Number(prod.price || 0),
            compareAtPrice: prod.compareAtPrice ? Number(prod.compareAtPrice) : null,
            stockQuantity: Number(prod.stockQuantity || 0),
            inStock: (prod.stockQuantity || 0) > 0,
            category: prod.category || "General",
            categorySlug: (prod.category || "General").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            imageUrl: primaryImage,
            images: imgs,
            rating: prod.rating || 4.8,
            reviewCount: prod.reviewCount || 12,
          };
        });
      }
    }
  } catch (err) {
    console.error(`Failed fetching products from database for tenant ${tenantId}:`, err);
  }

  return [];
}

// Real-time Database lookup helper for product details
export async function getProductData(productId: string, tenantId: string = "store"): Promise<StorefrontProduct | null> {
  try {
    const res = await fetch(`${API_URL}/store/${tenantId}/products/${productId}`, { next: { revalidate: 30 } });
    if (res.ok) {
      const prod = await res.json();
      if (prod) {
        let imgs: string[] = [];
        if (Array.isArray(prod.images)) {
          imgs = prod.images;
        } else if (typeof prod.images === "string" && prod.images) {
          try {
            imgs = JSON.parse(prod.images);
          } catch (e) {}
        }
        const primaryImage = imgs && imgs.length > 0 ? imgs[0] : "/basecart_storefront_mockup.png";

        return {
          id: prod.productId || prod.id,
          tenantId,
          name: prod.name,
          desc: prod.description || "",
          description: prod.description || "",
          price: Number(prod.price || 0),
          compareAtPrice: prod.compareAtPrice ? Number(prod.compareAtPrice) : null,
          inStock: (prod.stockQuantity || 0) > 0,
          stockQuantity: Number(prod.stockQuantity || 0),
          category: prod.category || "General",
          categorySlug: (prod.category || "General").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          imageUrl: primaryImage,
          images: imgs,
          rating: prod.rating || 4.8,
          reviewCount: prod.reviewCount || 12,
          reviews: prod.reviews || [],
        };
      }
    }
  } catch (err) {
    console.error(`Failed fetching product ${productId} from database:`, err);
  }

  // Fallback: search all products for tenantId
  try {
    const allProds = await getTenantProducts(tenantId);
    const found = allProds.find((p) => p.id === productId || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === productId);
    if (found) return found;
  } catch (e) {}

  return null;
}
