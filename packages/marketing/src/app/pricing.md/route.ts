import { PLANS, TRIAL, FAQS, PRICING_LAST_UPDATED } from "../../data/plans";

// ─────────────────────────────────────────────────────────────
// Machine-readable pricing for AI agents (served at /pricing.md)
// Generated from the same data module as the /pricing page, so
// it can never drift out of sync with what humans see.
// ─────────────────────────────────────────────────────────────

export const dynamic = "force-static";

function renderPricingMd(): string {
  const lines: string[] = [];

  lines.push(`# Basecart Pricing — Plans & Free Trial`);
  lines.push("");
  lines.push(
    `Basecart is an e-commerce platform for Indian sellers with 0% platform transaction fees, native WhatsApp checkout, UPI/COD payments (Razorpay), Shiprocket shipping automation and a 60-day free trial.`
  );
  lines.push("");
  lines.push(`> Last updated: ${PRICING_LAST_UPDATED}. All prices in INR (₹), billed monthly.`);
  lines.push(`> 0% platform transaction fees on every paid plan — you only pay standard payment gateway charges.`);
  lines.push(`> Sign up: https://dashboard.basecart.app/signup | Full pricing page: https://basecart.app/pricing`);
  lines.push("");

  lines.push(`## Free Trial`);
  lines.push("");
  lines.push(`- Price: ₹0/month`);
  lines.push(`- Duration: 60 days, or your first 100 orders / ₹25,000 in sales — whichever comes first`);
  lines.push(`- What's included: ${TRIAL.label}`);
  lines.push(`- No credit card required. Cancel anytime.`);
  lines.push("");

  for (const plan of PLANS) {
    lines.push(`## ${plan.name.charAt(0) + plan.name.slice(1).toLowerCase()}${plan.recommended ? " (Recommended)" : ""}`);
    lines.push("");
    lines.push(`- Price: ₹${plan.price.toLocaleString("en-IN")}/month`);
    lines.push(`- What's included: ${plan.summary}`);
    lines.push(`- Sign up: ${plan.ctaHref}`);
    lines.push("");
  }

  lines.push(`## Notes`);
  lines.push("");
  lines.push(`- No per-order platform fees on any plan.`);
  lines.push(`- No hidden costs: WhatsApp checkout, abandoned-cart recovery, Shiprocket automation and the AI product writer are built into the relevant plans — there is no per-app subscription stack.`);
  lines.push(`- Upgrade, downgrade or cancel anytime from the dashboard.`);
  lines.push("");

  lines.push(`## Frequently Asked Questions`);
  lines.push("");
  for (const f of FAQS) {
    lines.push(`**Q: ${f.q}**`);
    lines.push("");
    lines.push(`${f.a}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function GET() {
  return new Response(renderPricingMd(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}
