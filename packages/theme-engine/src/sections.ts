export type SectionType =
  | "hero"
  | "featured-products"
  | "collections"
  | "image-banner"
  | "gallery"
  | "newsletter"
  | "faq"
  | "brands"
  | "testimonials"
  | "rich-text"
  | "product-grid"
  | "recently-viewed"
  | "recommendations"
  | "custom-html";

export type BlockType =
  | "text"
  | "heading"
  | "button"
  | "image"
  | "video"
  | "icons"
  | "product-card"
  | "collection-card"
  | "countdown"
  | "social-links"
  | "divider";

export interface SettingSchema {
  id: string;
  type: "text" | "number" | "color" | "select" | "checkbox" | "image" | "url";
  label: string;
  default: any;
  options?: { label: string; value: string }[];
}

export interface BlockDefinition {
  type: BlockType;
  name: string;
  limit?: number;
  settings: SettingSchema[];
}

export interface SectionDefinition {
  type: SectionType;
  name: string;
  description?: string;
  maxBlocks?: number;
  settings: SettingSchema[];
  blocks?: BlockDefinition[];
}

export const CORE_SECTIONS: Record<SectionType, SectionDefinition> = {
  hero: {
    type: "hero",
    name: "Hero Banner",
    description: "High-impact visual banner with headline, subtext, and call-to-action button.",
    settings: [
      { id: "heading", type: "text", label: "Heading Text", default: "Built For Performance" },
      { id: "subtext", type: "text", label: "Subheading Text", default: "Explore our premium handpicked collection." },
      { id: "ctaText", type: "text", label: "Button Label", default: "Shop Now" },
      { id: "ctaUrl", type: "url", label: "Button URL", default: "/catalog" },
      { id: "bgImageUrl", type: "image", label: "Background Image", default: "" },
      { id: "overlayOpacity", type: "number", label: "Overlay Opacity (0-100)", default: 30 },
    ],
  },
  "featured-products": {
    type: "featured-products",
    name: "Featured Products",
    description: "Showcase selected catalog items in a grid layout.",
    settings: [
      { id: "title", type: "text", label: "Section Title", default: "Featured Items" },
      { id: "limit", type: "number", label: "Number of products to display", default: 4 },
      { id: "columns", type: "select", label: "Grid Columns", default: "4", options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ] },
    ],
  },
  collections: {
    type: "collections",
    name: "Collection Grid",
    description: "Display store categories and collection cards.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "Shop By Category" },
      { id: "limit", type: "number", label: "Maximum collections", default: 3 },
    ],
  },
  "image-banner": {
    type: "image-banner",
    name: "Image Banner",
    description: "Full-width visual banner with optional link.",
    settings: [
      { id: "imageUrl", type: "image", label: "Banner Image", default: "" },
      { id: "altText", type: "text", label: "Alt Text", default: "Banner image" },
      { id: "targetUrl", type: "url", label: "Target URL", default: "/catalog" },
    ],
  },
  gallery: {
    type: "gallery",
    name: "Image Gallery",
    description: "Grid of curated imagery and promotional cards.",
    settings: [
      { id: "columns", type: "select", label: "Columns", default: "3", options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ] },
    ],
  },
  newsletter: {
    type: "newsletter",
    name: "Newsletter Signup",
    description: "Email subscription form with promotional text.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "Get 10% Off Your First Order" },
      { id: "subtext", type: "text", label: "Subtext", default: "Subscribe to receive exclusive deals and new arrivals." },
      { id: "buttonText", type: "text", label: "Submit Button Label", default: "Subscribe" },
    ],
  },
  faq: {
    type: "faq",
    name: "Frequently Asked Questions",
    description: "Accordion FAQ list.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "Frequently Asked Questions" },
    ],
  },
  brands: {
    type: "brands",
    name: "Brand Logos Bar",
    description: "Row of partner or brand logos.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "Featured Brands" },
    ],
  },
  testimonials: {
    type: "testimonials",
    name: "Customer Reviews & Testimonials",
    description: "Quotes and ratings from verified buyers.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "What Our Customers Say" },
    ],
  },
  "rich-text": {
    type: "rich-text",
    name: "Rich Text Section",
    description: "Custom textual content and storytelling paragraph.",
    settings: [
      { id: "heading", type: "text", label: "Heading", default: "Our Story" },
      { id: "content", type: "text", label: "Content", default: "We design premium crafted goods for modern lifestyles." },
    ],
  },
  "product-grid": {
    type: "product-grid",
    name: "Product Catalog Grid",
    description: "Main catalog listing grid with pagination.",
    settings: [
      { id: "productsPerPage", type: "number", label: "Products per page", default: 12 },
      { id: "enableFilters", type: "checkbox", label: "Enable Sidebar Filters", default: true },
    ],
  },
  "recently-viewed": {
    type: "recently-viewed",
    name: "Recently Viewed Items",
    description: "Browser history product recommendation carousel.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "Recently Viewed" },
      { id: "limit", type: "number", label: "Maximum items", default: 4 },
    ],
  },
  recommendations: {
    type: "recommendations",
    name: "Recommended Products",
    description: "AI or tag-matched product recommendations.",
    settings: [
      { id: "title", type: "text", label: "Title", default: "You Might Also Like" },
      { id: "limit", type: "number", label: "Limit", default: 4 },
    ],
  },
  "custom-html": {
    type: "custom-html",
    name: "Custom HTML Block",
    description: "Embed custom HTML snippet safely.",
    settings: [
      { id: "htmlContent", type: "text", label: "HTML Content", default: "<div>Custom Content</div>" },
    ],
  },
};
