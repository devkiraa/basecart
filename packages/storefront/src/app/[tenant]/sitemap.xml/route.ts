import { getTenantStoreData, getTenantProducts } from "../../../lib/store";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { tenant: string } }
) {
  const { tenant } = params;

  try {
    const store = await getTenantStoreData(tenant);
    const products = await getTenantProducts(store.id);

    // Dynamic canonical domain mapping check
    const canonicalBase = store.customDomain
      ? `https://${store.customDomain}`
      : `https://${store.id}.basecart.app`;

    // Lastmod timestamp formatting
    const currentDate = new Date().toISOString().split("T")[0];

    // Assemble dynamic XML conforming to Sitemaps XML protocol
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Store catalog root path
    xml += `  <url>\n`;
    xml += `    <loc>${canonicalBase}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Iterative product URL pathways
    products.forEach((product) => {
      xml += `  <url>\n`;
      xml += `    <loc>${canonicalBase}/products/${product.id}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "X-Robots-Tag": "noindex, follow", // Prevent index of xml itself, but allow index of internal urls
      },
    });
  } catch (error) {
    console.error(`Sitemap compilation error for tenant ${tenant}:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
