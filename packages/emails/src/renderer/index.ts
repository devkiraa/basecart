import { renderOTP } from "../templates/otp";
import { renderWelcome } from "../templates/welcome";
import { renderPasswordReset } from "../templates/password-reset";
import { renderOrderConfirmation } from "../templates/order-confirmation";
import { renderOrderShipped } from "../templates/order-shipped";
import { renderInvoice } from "../templates/invoice";
import { renderPaymentFailed } from "../templates/payment-failed";
import { renderSubscription } from "../templates/subscription";
import { renderTeamInvite } from "../templates/team-invite";
import { EmailType } from "../types";

export function renderEmail(
  type: EmailType,
  data: any
): {
  subject: string;
  html: string;
  text: string;
} {
  switch (type) {
    case "otp":
      return renderOTP(data);
    case "welcome":
      return renderWelcome(data);
    case "password-reset":
      return renderPasswordReset(data);
    case "order-confirmation":
      return renderOrderConfirmation(data);
    case "order-shipped":
      return renderOrderShipped(data);
    case "invoice":
      return renderInvoice(data);
    case "payment-failed":
      return renderPaymentFailed(data);
    case "subscription":
      return renderSubscription(data);
    case "team-invite":
      return renderTeamInvite(data);
    default:
      throw new Error(`Unsupported email type: ${type}`);
  }
}
