# Basecart Customer Storefront (`@basecart/storefront`)

A fast customer shopping storefront built with Next.js and Tailwind CSS. It connects to the shared backend to resolve store branding, list products, apply discount codes, and process payments.

## Architecture & Features
1.  **Subdomain Routing**: Dynamically resolves the store tenant based on the host subdomain (e.g., `mystore.localhost:3002` resolves `mystore`), loading unique branding colors, names, and products.
2.  **Product Catalog**: Responsive cards with modals showing descriptions and inventory statuses.
3.  **Active Cart Drawer**: Subtotal recalculation and live backend coupon validation checks.
4.  **Checkout Form**: Inputs for shipping addresses and phone contacts.
5.  **Razorpay Integration**: Loads the official Razorpay Checkout script, creates orders via the backend checkout API, triggers the payment modal, and handles simulated test payment callbacks.
6.  **Customer Account**: Customer signup/login and purchase history tracking.
