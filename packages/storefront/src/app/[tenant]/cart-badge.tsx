"use client";

import { useCart } from "../../lib/cart";

export function CartBadge({ tenantId }: { tenantId: string }) {
  const { itemCount } = useCart(tenantId);
  if (itemCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center bg-[var(--color-primary)] text-white text-[9px] font-extrabold rounded-full px-1">
      {itemCount}
    </span>
  );
}
