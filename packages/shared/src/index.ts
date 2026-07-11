import { z } from "zod";

// --- Merchant Auth ---
export const MerchantSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  storeName: z.string().min(2),
  subdomain: z
    .string()
    .min(2)
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain must be lowercase alphanumeric or hyphens"
    ),
}).strict();

export type MerchantSignupInput = z.infer<typeof MerchantSignupSchema>;

export const MerchantLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}).strict();

export type MerchantLoginInput = z.infer<typeof MerchantLoginSchema>;

// --- Store Settings ---
export const StoreSettingsSchema = z.object({
  storeName: z.string().min(2),
  razorpayKey: z.string().optional(),
  razorpaySecret: z.string().optional(),
  customDomain: z.string().optional(),
  addOns: z.array(z.string()).optional(),
  gstin: z.string().optional(),
  registeredBusinessName: z.string().optional(),
  registeredBusinessAddress: z.string().optional(),
  registeredState: z.string().optional(),
  branding: z
    .object({
      logoUrl: z.string().url().optional().or(z.literal("")),
      primaryColor: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
      accentColor: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
    })
    .optional(),
}).strict();

export type StoreSettingsInput = z.infer<typeof StoreSettingsSchema>;

// --- Product ---
export const ProductVariantSchema = z.object({
  id: z.string(),
  options: z.record(z.string(), z.string()),
  price: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
});

export const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  price: z.number().positive(),
  stockQuantity: z.number().int().nonnegative(),
  status: z.enum(["active", "draft"]),
  images: z.array(z.string().url()),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPerItem: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  category: z.enum(["Clothing", "Electronics", "Home & Kitchen", "Beauty", "Food", "Other"]),
  productType: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  continueSellingOutOfStock: z.boolean().optional().default(false),
  variants: z.array(ProductVariantSchema).optional(),
}).strict();

export type ProductInput = z.infer<typeof ProductSchema>;

// --- Discount Code ---
export const DiscountCodeSchema = z.object({
  code: z.string().min(2).toUpperCase(),
  type: z.enum(["percentage", "flat"]),
  value: z.number().positive(),
  minOrderAmount: z.number().nonnegative().default(0),
  usageLimit: z.number().int().positive().optional(),
  expiry: z.string().datetime().optional(),
  active: z.boolean().default(true),
}).strict();

export type DiscountCodeInput = z.infer<typeof DiscountCodeSchema>;

// --- Cart Validation ---
export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const CartValidateSchema = z.object({
  lineItems: z.array(CartItemSchema).min(1),
  discountCode: z.string().optional(),
}).strict();

export type CartValidateInput = z.infer<typeof CartValidateSchema>;

// --- Checkout ---
export const CheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.object({
    addressLine1: z.string().min(3),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(6).max(6), // Indian pincodes are 6 digits
    country: z.string().default("India"),
  }),
  lineItems: z.array(CartItemSchema).min(1),
  discountCode: z.string().optional(),
  idempotencyKey: z.string().uuid().or(z.string().min(10)),
}).strict();

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

// --- Customer Auth ---
export const CustomerSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
}).strict();

export type CustomerSignupInput = z.infer<typeof CustomerSignupSchema>;

export const CustomerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}).strict();

export type CustomerLoginInput = z.infer<typeof CustomerLoginSchema>;

// --- Order Status Update (Merchant) ---
export const OrderStatusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
}).strict();

export type OrderStatusUpdateInput = z.infer<typeof OrderStatusUpdateSchema>;
