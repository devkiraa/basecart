/**
 * Shiprocket Shipping Integration Service
 */
export interface ShipmentDetails {
  orderId: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerPostalCode: string;
  totalWeightKg: number;
}

/**
 * Creates a shipping order / AWB tracking assignment in Shiprocket.
 * In a real production setup, this would exchange authorization tokens and POST
 * to the Shiprocket API `/v1/external/shipments/create/forward-shipment`.
 *
 * Shiprocket API Example:
 * ```typescript
 * // 1. Authenticate to get jwt token
 * const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD })
 * });
 * const { token } = await authRes.json();
 *
 * // 2. Create custom forward shipment
 * const shipmentRes = await fetch("https://apiv2.shiprocket.in/v1/external/shipments/create/forward-shipment", {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": "application/json",
 *     "Authorization": `Bearer ${token}`
 *   },
 *   body: JSON.stringify({
 *     order_id: details.orderId,
 *     order_date: new Date().toISOString(),
 *     pickup_location: store.registeredBusinessName || "Primary Pickup",
 *     billing_customer_name: details.customerName,
 *     billing_address: details.customerAddress,
 *     billing_city: details.customerCity,
 *     billing_state: details.customerState,
 *     billing_pincode: details.customerPostalCode,
 *     shipping_is_billing: true,
 *     order_items: [],
 *     payment_method: "Prepaid",
 *     sub_total: total,
 *     length: 10, width: 10, height: 10, weight: details.totalWeightKg
 *   })
 * });
 * const resJson = await shipmentRes.json();
 * const trackingNumber = resJson.awb_code;
 * ```
 */
export async function createShiprocketShipment(
  details: ShipmentDetails,
  storeGstin: string
): Promise<{ trackingNumber: string; carrier: string }> {
  console.log(`🚚 [SHIPROCKET] Booking shipment for Order ID: ${details.orderId}`);
  console.log(`📍 Shipping address: ${details.customerAddress}, ${details.customerCity}, ${details.customerPostalCode}`);

  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.warn("⚠️ Shiprocket production credentials missing. Generating mock tracking details.");
      return {
        trackingNumber: `SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        carrier: "Shiprocket (Mock)",
      };
    }
  }

  // Local/LocalStack mock returns a unique generated AWB tracking code
  const randomAwb = `SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  return {
    trackingNumber: randomAwb,
    carrier: "Shiprocket (Mock)",
  };
}

/**
 * Verifies the incoming Shiprocket Webhook signature.
 * Shiprocket can sign webhook requests using a pre-shared webhook token or basic auth headers.
 */
export function verifyShiprocketSignature(
  headerToken: string | undefined,
  expectedToken: string
): boolean {
  if (!headerToken) return false;
  // A simple security token match for webhook payload verification
  return headerToken === expectedToken;
}
