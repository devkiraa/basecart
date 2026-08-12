import { redirect } from "next/navigation";

export const runtime = "edge";

// Checkout functionality has been removed — redirect to catalog
export default function CheckoutPage() {
  redirect("/catalog");
}
