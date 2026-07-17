// Database lookup helper (simulate real-time database resolutions)
export async function getTenantStoreData(tenant: string) {
  const mockDb: Record<string, { id: string; name: string; customDomain?: string; description: string; logoUrl: string }> = {
    "boutique": {
      id: "boutique",
      name: "Bespoke Boutique",
      customDomain: "myboutique.in", // Mapped custom domain
      description: "Premium handcrafted apparel and designer wear from Kerala.",
      logoUrl: "https://r2.basecart.app/stores/boutique/logo.png",
    },
    "bakes": {
      id: "bakes",
      name: "Kochi Cake Studio",
      // No custom domain mapped (uses default bakes.basecart.app)
      description: "Artisanal custom cakes and pastries delivered fresh across Ernakulam.",
      logoUrl: "https://r2.basecart.app/stores/bakes/logo.png",
    }
  };

  // If the tenant parameter contains a dot (representing a mapped custom domain rewrite)
  if (tenant.includes(".")) {
    const resolved = Object.values(mockDb).find(store => store.customDomain === tenant);
    if (resolved) return resolved;
  }

  return mockDb[tenant] || {
    id: tenant,
    name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Store`,
    description: "Welcome to our Basecart automated checkout storefront.",
    logoUrl: "https://basecart.app/icon.svg",
  };
}

// Mock products database
export async function getTenantProducts(tenantId: string) {
  const allProducts = [
    {
      id: "prod-1",
      tenantId: "boutique",
      name: "Handcrafted Silk Kasavu Saree",
      desc: "Elegant traditional handwoven Kerala Kasavu saree with gold brocade borders, perfect for festivals.",
      price: 4999,
      imageUrl: "/basecart_storefront_mockup.png", // Stand-in image
    },
    {
      id: "prod-2",
      tenantId: "bakes",
      name: "Chocolate Fudge Celebration Cake",
      desc: "Decadent double-layered Belgian dark chocolate cake, perfect for birthdays and parties.",
      price: 1200,
      imageUrl: "/basecart_dashboard_mockup.png", // Stand-in image
    }
  ];

  // Filter products by tenant; if tenant is unmapped, return both as fallbacks
  const filtered = allProducts.filter(prod => prod.tenantId === tenantId);
  return filtered.length > 0 ? filtered : allProducts;
}

// Mock product details resolver
export async function getProductData(productId: string) {
  const mockProducts: Record<string, { id: string; name: string; description: string; price: number; inStock: boolean; category: string; categorySlug: string; imageUrl: string }> = {
    "prod-1": {
      id: "prod-1",
      name: "Handcrafted Silk Kasavu Saree",
      description: "Elegant traditional handwoven Kerala Kasavu saree with gold brocade borders, perfect for weddings, festivals, and cultural events.",
      price: 4999,
      inStock: true,
      category: "Ethnic Wear",
      categorySlug: "ethnic-wear",
      imageUrl: "https://r2.basecart.app/stores/boutique/products/kasavu-saree.jpg", // Cloudflare R2 path
    },
    "prod-2": {
      id: "prod-2",
      name: "Chocolate Fudge Celebration Cake",
      description: "Decadent double-layered Belgian dark chocolate cake with rich fudge frosting, baked fresh in Kochi.",
      price: 1200,
      inStock: true,
      category: "Celebration Cakes",
      categorySlug: "celebration-cakes",
      imageUrl: "https://r2.basecart.app/stores/bakes/products/chocolate-fudge-cake.jpg", // Cloudflare R2 path
    }
  };
  return mockProducts[productId];
}
