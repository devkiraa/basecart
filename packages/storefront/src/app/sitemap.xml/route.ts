import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const urlObj = new URL(request.url);
  const host = request.headers.get("host") || "";
  
  // Resolve subdomain
  let subdomain = "demo";
  const parts = host.split(".");
  if (parts.length >= 2 && parts[0] !== "localhost" && parts[0] !== "www") {
    subdomain = parts[0];
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  let products: any[] = [];
  try {
    const prodRes = await fetch(`${apiUrl}/store/${subdomain}/products`, {
      next: { revalidate: 60 },
    });
    if (prodRes.ok) {
      products = await prodRes.json();
    }
  } catch (err) {
    console.error("Failed to fetch products for sitemap.xml", err);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${products
    .map(
      (prod) => `
  <url>
    <loc>http://${host}/#product-${prod.productId}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
