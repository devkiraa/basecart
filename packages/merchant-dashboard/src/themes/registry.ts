export interface SettingField {
  id: string;
  type: "color" | "text" | "checkbox" | "select";
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
  templateBase: "Pulse" | "Origin" | "Stride" | "Aura";
  schema: SettingGroup[];
  defaults: Record<string, any>;
}

// Define the generic configuration schema shared across themes
export const THEME_SETTINGS_SCHEMA: SettingGroup[] = [
  {
    id: "branding",
    title: "Logo & Colors",
    fields: [
      { id: "logoUrl", type: "text", label: "Logo URL", default: "" },
      { id: "colorPrimary", type: "color", label: "Primary Brand Color", default: "#4F46E5" },
      { id: "colorSecondary", type: "color", label: "Secondary Color", default: "#4338CA" },
      { id: "colorAccent", type: "color", label: "Accent Color", default: "#F59E0B" },
      { id: "colorBg", type: "color", label: "Page Background Color", default: "#FFFFFF" },
      { id: "colorText", type: "color", label: "Body Text Color", default: "#1F2937" }
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
    id: "vogue",
    name: "Vogue",
    version: "1.2.0",
    description: "Clean and modern fashion theme built for conversion.",
    category: "Fashion",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    isNew: true,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Pulse",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#E11D48",
      colorSecondary: "#BE123C",
      fontHeading: "serif"
    }
  },
  {
    id: "nova",
    name: "Nova",
    version: "2.0.1",
    description: "Perfect for electronics stores with dark elements.",
    category: "Electronics",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
    isNew: true,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Aura",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#0F172A",
      colorSecondary: "#1E293B"
    }
  },
  {
    id: "botanica",
    name: "Botanica",
    version: "1.0.0",
    description: "Ideal for home, plants, and organic living products.",
    category: "Home & Living",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=300&q=80",
    isNew: true,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Origin",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#15803D",
      colorSecondary: "#166534",
      fontHeading: "serif"
    }
  },
  {
    id: "aura",
    name: "Aura",
    version: "1.1.2",
    description: "Minimal and elegant watchroom fashion theme.",
    category: "Fashion",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80",
    isNew: false,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Aura",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: GLOBAL_DEFAULTS
  },
  {
    id: "impulse",
    name: "Impulse",
    version: "2.1.0",
    description: "Bold fitness theme built for sports catalogs.",
    category: "Sports",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80",
    isNew: false,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Pulse",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#F97316",
      colorSecondary: "#EA580C"
    }
  },
  {
    id: "bookish",
    name: "Bookish",
    version: "1.0.3",
    description: "Classic typography optimized for bookstore and art items.",
    category: "Books",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80",
    isNew: false,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Origin",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#8B5CF6",
      colorSecondary: "#7C3AED",
      fontHeading: "serif"
    }
  },
  {
    id: "gusto",
    name: "Gusto",
    version: "1.4.0",
    description: "Great for gourmet food, cafes, and bakeries.",
    category: "Food",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80",
    isNew: false,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Stride",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#EF4444",
      colorSecondary: "#DC2626"
    }
  },
  {
    id: "glow",
    name: "Glow",
    version: "1.0.1",
    description: "Charming layout optimized for beauty and cosmetics.",
    category: "Beauty",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80",
    isNew: false,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Pulse",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#EC4899",
      colorSecondary: "#DB2777"
    }
  },
  {
    id: "crafty",
    name: "Crafty",
    version: "1.2.1",
    description: "Handcrafted layout perfect for artisans and designers.",
    category: "Minimal",
    price: "Free",
    previewImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    previewMobileImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80",
    isNew: false,
    features: ["Mobile Responsive", "SEO Optimized", "Fast Loading", "Accessibility Ready"],
    templateBase: "Aura",
    schema: THEME_SETTINGS_SCHEMA,
    defaults: {
      ...GLOBAL_DEFAULTS,
      colorPrimary: "#D97706",
      colorSecondary: "#B45309"
    }
  }
];
