import { redirect } from "next/navigation";

export const runtime = "edge";

// Cart functionality has been removed — redirect to catalog
export default function CartPage() {
  redirect("/catalog");
}
