# Basecart Design System

## Objective
Establish a unified visual language for Basecart's e-commerce SaaS platform, ensuring consistent user experience across marketing site, merchant dashboard, admin panel, and storefront. The design system prioritizes clarity, trust, and efficient task completion for Indian social commerce merchants.

## Product Context
- **Industry:** E-commerce SaaS (India-first)
- **Target Users:** Instagram boutiques, home businesses, D2C brands
- **Primary Actions:** Store setup, product management, order processing, payment handling
- **Key Differentiator:** WhatsApp/DM automation, local payments (Razorpay UPI), regional shipping

## Visual Foundations

### Color System
```css
/* Primary Palette */
--color-primary: #2563EB;        /* Blue-600 - Primary actions */
--color-primary-hover: #1D4ED8;  /* Blue-700 - Hover states */
--color-primary-subtle: #EFF6FF; /* Blue-50 - Backgrounds */

/* Neutral Palette */
--color-bg: #FFFFFF;             /* White - Main background */
--color-bg-subtle: #F8FAFC;      /* Slate-50 - Subtle backgrounds */
--color-text: #0F172A;           /* Slate-900 - Headings */
--color-text-muted: #64748B;     /* Slate-500 - Body text */
--color-border: #F1F5F9;         /* Slate-100 - Borders */

/* Semantic Colors */
--color-success: #10B981;        /* Emerald-500 - Success states */
--color-error: #EF4444;          /* Red-500 - Error states */
--color-warning: #F59E0B;        /* Amber-500 - Warnings */
```

### Typography
```css
/* Font Family */
--font-sans: 'Plus Jakarta Sans', sans-serif;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px - Labels, captions */
--text-sm: 0.875rem;   /* 14px - Body text */
--text-base: 1rem;     /* 16px - Default */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Hero headings */
--text-5xl: 3rem;      /* 48px - Display */

/* Font Weights */
--font-normal: 400;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0em;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### Spacing & Layout
```css
/* Border Radius */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Max Widths */
--max-w-sm: 640px;
--max-w-md: 768px;
--max-w-lg: 1024px;
--max-w-xl: 1280px;
--max-w-2xl: 1536px;
```

### Component Patterns

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}
.btn-primary:active {
  transform: scale(0.98);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-weight: 700;
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-lg);
  transition: all 0.15s ease;
}
.btn-secondary:hover {
  background: var(--color-bg-subtle);
}
```

#### Cards
```css
.card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  transition: all 0.3s ease;
}
.card:hover {
  box-shadow: var(--shadow-xl);
  border-color: #E2E8F0;
  transform: translateY(-2px);
}
```

#### Form Elements
```css
/* Input */
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #CBD5E1;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--color-text);
  transition: border-color 0.15s ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Label */
.label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
}
```

### Iconography
- **Library:** Lucide React
- **Size:** 16px (h-4 w-4) for inline, 20px (h-5 w-5) for standalone
- **Color:** Blue-600 for primary, Slate-500 for muted
- **Style:** Outline, 1.5px stroke

### Animations
```css
/* Transitions */
transition-all: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
transition-colors: color, background-color, border-color 0.15s ease;
transition-transform: transform 0.15s ease;

/* Hover Effects */
hover:-translate-y-1;      /* Cards */
hover:shadow-xl;           /* Cards */
hover:bg-blue-700;         /* Primary buttons */
active:scale-95;           /* Click feedback */

/* Loading States */
.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

## Accessibility
- **Focus States:** 3px ring with 10% opacity primary color
- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements focusable and operable
- **Screen Reader:** Semantic HTML, ARIA labels where needed
- **Motion:** Respect `prefers-reduced-motion` for animations

## Voice & Tone
- **Headlines:** Confident, direct, action-oriented
- **Body Copy:** Clear, concise, benefit-focused
- **Labels:** Uppercase, tracked-wide for scannability
- **Error Messages:** Helpful, specific, solution-oriented
- **Success Messages:** Brief, celebratory, next-step focused

## Implementation Practices
- **CSS Architecture:** Tailwind CSS with CSS custom properties for design tokens
- **Component Library:** React components with TypeScript
- **Responsive Design:** Mobile-first, breakpoint-based layouts
- **State Management:** React hooks (useState, useEffect)
- **Form Handling:** Controlled components with validation

## Anti-Patterns to Avoid
- **Generic Gradient Heroes:** Avoid purple-blue-cyan gradients; use subtle slate/blue tints
- **Rounded-16px Card Grids:** Use varied card sizes and layouts
- **Emoji Decoration:** Minimize emoji use; prefer icons for clarity
- **Isometric Illustrations:** Use real product screenshots/mockups
- **Floating Stat Cards:** Contextualize statistics within content flow
- **Fill-Only Buttons:** Mix primary, secondary, and ghost button styles
- **Vague Copy:** Be specific about features and benefits
- **Em-dash Overuse:** Use periods and commas for natural rhythm

## Decision-Making Framework
When making design decisions:
1. **Clarity over aesthetics** - If it looks good but confuses users, simplify
2. **Consistency over novelty** - Follow established patterns unless there's a strong reason
3. **Performance over decoration** - Every visual element must serve a purpose
4. **Accessibility as baseline** - Not an afterthought, but a starting point
5. **Mobile-first thinking** - Design for small screens, enhance for large

## Workflow
1. **Reference this DESIGN.md** before creating new components or pages
2. **Use design tokens** from CSS custom properties, not hardcoded values
3. **Follow component patterns** for consistency
4. **Test across breakpoints** - mobile, tablet, desktop
5. **Validate accessibility** - keyboard, screen reader, color contrast
