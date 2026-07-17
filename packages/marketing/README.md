# Basecart Merchant Dashboard (`@basecart/merchant-dashboard`)

A modern, responsive merchant dashboard built with Next.js and Tailwind CSS. Styled per the premium Supabase Light design system.

## Key Features
1.  **Onboarding**: Multi-step registration allowing store name selection and subdomain prefix creation.
2.  **Product CRUD**: Rich forms to add, edit, or archive items with status (active/draft) selectors.
3.  **Direct S3 Media Upload**: Request a presigned S3 upload URL from the backend, validate file types (JPEG/PNG/GIF/WebP) and magic header bytes, and upload directly to S3.
4.  **Order Manager**: View customer profiles, items purchased, and transition order states (e.g. processing, shipped, delivered).
5.  **Coupons Control**: Set discount campaigns, limits, minimum spends, and flat/percentage rates.
6.  **Analytics Summary**: Interactive metrics (sales revenue, count summaries) and daily sales timeline graphs.

## Frontend Stack & Config
*   **Routing**: Next.js App Router (located at `src/app/`).
*   **Styling**: Tailwind CSS configured in `tailwind.config.js` with consistent borders, hover effects, and cards.
*   **Icons**: Lucide React.
