import { describe, expect, it } from "vitest";
import { renderEmail, sendEmail } from "@basecart/emails";

describe("Part 6: Transactional Email Templates & Renderer", () => {
  it("should correctly render the OTP template with HTML and plain text", () => {
    const { subject, html, text } = renderEmail("otp", {
      code: "887722",
      expiresMinutes: 15,
      storeName: "TestBasecart",
    });

    expect(subject).toBe("Your Verification Code: 887722");
    expect(html).toContain("887722");
    expect(html).toContain("15 minutes");
    expect(html).toContain("TestBasecart");
    expect(text).toContain("Verification Code: 887722");
    expect(text).toContain("15 minutes");
  });

  it("should correctly render the Welcome template with verification link", () => {
    const { subject, html, text } = renderEmail("welcome", {
      userName: "Kiran",
      verifyLink: "https://basecart.app/verify?token=123",
      storeName: "TestBasecart",
    });

    expect(subject).toBe("Welcome to TestBasecart!");
    expect(html).toContain("Welcome to Basecart, Kiran!");
    expect(html).toContain("https://basecart.app/verify?token=123");
    expect(text).toContain("https://basecart.app/verify?token=123");
  });

  it("should correctly render the Order Confirmation template with attachments and details", () => {
    const { subject, html, text } = renderEmail("order-confirmation", {
      orderId: "order-123456",
      customerName: "Kiran G",
      total: 1299,
      invoiceNumber: "INV-2026-0001",
      storeName: "Fashion Hub",
    });

    expect(subject).toBe("Order Confirmation - #ORDER-12");
    expect(html).toContain("Hi Kiran G");
    expect(html).toContain("₹1299");
    expect(html).toContain("INV-2026-0001");
    expect(text).toContain("Amount Paid: ₹1299");
    expect(text).toContain("Invoice Number: INV-2026-0001");
  });

  it("should fallback to direct send if JOBS_QUEUE is missing on env", async () => {
    // Should run synchronously without errors
    const payload = {
      type: "otp" as const,
      to: "test@example.com",
      data: {
        code: "112233",
      },
    };

    // In test environment, the index.ts sendEmail has a short-circuit that prevents actual fetch calls.
    // We verify it calls successfully without throwing exceptions.
    await expect(sendEmail(payload, {})).resolves.not.toThrow();
  });
});
