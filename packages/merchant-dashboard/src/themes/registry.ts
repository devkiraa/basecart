export interface SettingField {
  id: string;
  type: "color" | "text" | "checkbox" | "select" | "image";
  label: string;
  default: any;
  options?: { value: string; label: string }[];
}

export interface SettingGroup {
  id: string;
  title: string;
  fields: SettingField[];
}

export interface Theme {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  price: string;
  previewImage: string;
  previewMobileImage: string;
  isNew: boolean;
  features: string[];
  templateBase: "Pulse" | "Origin" | "Stride" | "Aura" | "Satoshi";
  schema: SettingGroup[];
  defaults: Record<string, any>;
}

// Define the generic configuration schema shared across themes
export const THEME_SETTINGS_SCHEMA: SettingGroup[] = [
  {
    id: "branding",
    title: "Logo & Colors",
    fields: [
      { id: "logoUrl", type: "image", label: "Store Logo Image", default: "" },
      { id: "colorPrimary", type: "color", label: "Primary Brand Color", default: "#4F46E5" },
      { id: "colorSecondary", type: "color", label: "Secondary Color", default: "#4338CA" },
      { id: "colorAccent", type: "color", label: "Accent Color", default: "#F59E0B" },
      { id: "colorBg", type: "color", label: "Page Background Color", default: "#FFFFFF" },
      { id: "colorText", type: "color", label: "Body Text Color", default: "#1F2937" }
    ]
  },
  {
    id: "backgrounds",
    title: "Background Images & Custom Media",
    fields: [
      { id: "heroBackgroundImage", type: "image", label: "Hero Banner Background Image", default: "" },
      { id: "pageBackgroundImage", type: "image", label: "Storefront Page Background Image", default: "" },
      { id: "headerBackgroundImage", type: "image", label: "Header Navigation Background Image", default: "" },
      { id: "announcementBgColor", type: "color", label: "Announcement Bar Background", default: "#090D16" },
      { id: "announcementTextColor", type: "color", label: "Announcement Bar Text Color", default: "#FFFFFF" },
      { id: "headerBgColor", type: "color", label: "Header Bar Background", default: "#FFFFFF" },
      { id: "footerBgColor", type: "color", label: "Footer Background Color", default: "#090D16" },
      { id: "newsletterBgColor", type: "color", label: "Special Offer / Newsletter Background", default: "#F5F2EB" }
    ]
  },
  {
    id: "typography",
    title: "Typography",
    fields: [
      {
        id: "fontHeading",
        type: "select",
        label: "Heading Font Family",
        default: "sans",
        options: [
          { value: "sans", label: "Sans-Serif (Inter)" },
          { value: "serif", label: "Classic Serif (Merriweather)" },
          { value: "mono", label: "Monospace font" }
        ]
      },
      {
        id: "fontBody",
        type: "select",
        label: "Body Font Family",
        default: "sans",
        options: [
          { value: "sans", label: "Sans-Serif (Inter)" },
          { value: "serif", label: "Classic Serif" },
          { value: "mono", label: "Monospace" }
        ]
      }
    ]
  },
  {
    id: "layout",
    title: "Layout & Spacing",
    fields: [
      {
        id: "buttonRadius",
        type: "select",
        label: "Button Border Radius",
        default: "8px",
        options: [
          { value: "0px", label: "Square (0px)" },
          { value: "4px", label: "Soft Rounded (4px)" },
          { value: "8px", label: "Standard Rounded (8px)" },
          { value: "9999px", label: "Pill Shape" }
        ]
      },
      {
        id: "containerWidth",
        type: "select",
        label: "Page Container Width",
        default: "max-w-7xl",
        options: [
          { value: "max-w-5xl", label: "Compact (5xl)" },
          { value: "max-w-7xl", label: "Standard (7xl)" },
          { value: "max-w-full", label: "Full Width" }
        ]
      }
    ]
  },
  {
    id: "headerFooter",
    title: "Header & Footer Options",
    fields: [
      { id: "enableAnnouncement", type: "checkbox", label: "Enable Announcement Bar", default: true },
      { id: "announcementText", type: "text", label: "Announcement Bar Text", default: "Free shipping on orders over ₹999! 🚚" },
      { id: "stickyHeader", type: "checkbox", label: "Sticky Header Bar", default: true },
      { id: "enableSearch", type: "checkbox", label: "Enable Search bar in header", default: true }
    ]
  },
  {
    id: "features",
    title: "Storewide Feature Options",
    fields: [
      { id: "enableWishlist", type: "checkbox", label: "Enable Store Wishlist", default: true },
      { id: "enableQuickView", type: "checkbox", label: "Enable Product Quick View modal", default: true },
      { id: "stickyCart", type: "checkbox", label: "Sticky Bottom Cart bar", default: true },
      { id: "backToTop", type: "checkbox", label: "Back to top scroll button", default: true },
      { id: "breadcrumbs", type: "checkbox", label: "Show breadcrumb navigation path", default: true },
      { id: "lazyLoading", type: "checkbox", label: "Enable image lazy loading", default: true },
      { id: "infiniteScroll", type: "checkbox", label: "Use infinite scroll instead of pagination", default: false }
    ]
  }
];

// Compile defaults helper
function getDefaultsForSchema(): Record<string, any> {
  const defaults: Record<string, any> = {};
  THEME_SETTINGS_SCHEMA.forEach(group => {
    group.fields.forEach(field => {
      defaults[field.id] = field.default;
    });
  });
  return defaults;
}

const GLOBAL_DEFAULTS = getDefaultsForSchema();

export const THEME_LIBRARY: Theme[] = [
  {
    id: "satoshi",
    name: "Satoshi",
    version: "1.0.0",
    description: "Ultra-modern geometric layout with soft off-white product gallery frames, interactive size grids, and high-conversion sneaker storefront spotlight.",
    category: "Footwear & Fashion",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
    isNew: true,
    features: ["Satoshi Geometric UI", "Interactive Size & Swatch Selector", "Soft Cream Gallery Spotlight", "High Conversion Checkout CTA"],
    templateBase: "Satoshi",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#010101",
      colorSecondary: "#F2F0EA",
      colorAccent: "#EDCF5D",
      colorBg: "#FFFFFF",
      colorText: "#010101",
      fontHeading: "sans",
      fontBody: "sans",
      buttonRadius: "9999px"
    }
  }
];
