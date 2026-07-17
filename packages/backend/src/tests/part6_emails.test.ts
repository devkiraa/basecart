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

  it("should resolve sender aliases correctly using resolveSender utility", () => {
    const { resolveSender } = require("@basecart/emails");

    // 1. Fallback default
    const sender1 = resolveSender("otp", {});
    expect(sender1.address).toBe("otp@basecart.app");
    expect(sender1.name).toBe("Basecart Security");

    // 2. Separate env vars
    const envVars = {
      MAIL_FROM_ADDRESS: "main@basecart.app",
      MAIL_FROM_NAME: "Basecart Main",
      MAIL_FROM_OTP: "otp-override@basecart.app",
      MAIL_FROM_OTP_NAME: "Basecart OTP Security",
    };
    const sender2 = resolveSender("otp", envVars);
    expect(sender2.address).toBe("otp-override@basecart.app");
    expect(sender2.name).toBe("Basecart OTP Security");

    // 3. EMAIL_ALIASES parsed JSON object (Cloudflare standard)
    const envJsonObj = {
      EMAIL_ALIASES: {
        default: { address: "default-json@basecart.app", name: "JSON Default" },
        otp: { address: "otp-json@basecart.app", name: "JSON OTP" },
      },
    };
    const sender3 = resolveSender("otp", envJsonObj);
    expect(sender3.address).toBe("otp-json@basecart.app");
    expect(sender3.name).toBe("JSON OTP");

    const sender4 = resolveSender("welcome", envJsonObj);
    expect(sender4.address).toBe("default-json@basecart.app");
    expect(sender4.name).toBe("JSON Default");

    // 4. EMAIL_ALIASES stringified JSON (Local dotenv fallback)
    const envJsonStr = {
      EMAIL_ALIASES: JSON.stringify({
        otp: { address: "otp-string-json@basecart.app", name: "String JSON OTP" },
      }),
    };
    const sender5 = resolveSender("otp", envJsonStr);
    expect(sender5.address).toBe("otp-string-json@basecart.app");
    expect(sender5.name).toBe("String JSON OTP");
  });
});
