import { SQSEvent, SQSHandler } from "aws-lambda";
import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { sesClient, ddbDocClient, s3Client } from "./lib/aws";
import { generateInvoicePdf } from "./lib/pdf";
import { sendWhatsAppMessage } from "./services/whatsapp";
import nodemailer from "nodemailer";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";
const S3_BUCKET_NAME = process.env.S3_BUCKET || "basecart-media-bucket";

// Mail composer to format multipart raw MIME messages for SES attachments
const mailComposer = nodemailer.createTransport({
  streamTransport: true,
  newline: "windows",
});

/**
 * SQS Background Queue Handler
 * Processes async jobs like order confirmation emails, GST PDF generation, and WhatsApp notifications
 */
export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log(`📥 SQS Job Processor triggered. Records count: ${event.Records.length}`);
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      console.log("Processing SQS Job:", body);

      const { type, tenantId, orderId } = body;

      // 1. Handle Order Email Confirmation & GST Invoicing
      if (type === "ORDER_CONFIRMATION") {
        const { email, total } = body;

        // Idempotency: Verify that we have not already successfully sent confirmation for this order
        try {
          await ddbDocClient.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: {
                PK: `ORDER#${orderId}`,
                SK: "EMAIL_SENT",
                sentAt: new Date().toISOString(),
              },
              ConditionExpression: "attribute_not_exists(PK)",
            })
          );
        } catch (err: any) {
          if (err.name === "ConditionalCheckFailedException") {
            console.log(`⚠️ Email for orderId ${orderId} was already sent. Skipping duplicate send.`);
            continue;
          }
          throw err;
        }

        // Fetch store settings and order details
        const [storeRes, orderRes] = await Promise.all([
          ddbDocClient.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
            })
          ),
          ddbDocClient.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: { PK: `TENANT#${tenantId}`, SK: `ORDER#${orderId}` },
            })
          ),
        ]);

        const store = storeRes.Item;
        const order = orderRes.Item;

        if (!order) {
          throw new Error(`Order ${orderId} not found in DB`);
        }

        let pdfBuffer: Buffer | undefined;
        let invoiceNumber = order.invoiceNumber;
        let invoiceUrl = order.invoiceUrl;

        // Check if GST invoice add-on is active
        if (store && store.addOns?.includes("gst_invoice") && store.gstin) {
          // If invoice does not exist yet, generate one
          if (!invoiceUrl) {
            // Atomic increment for sequential invoice numbering
            const updateSeqRes = await ddbDocClient.send(
              new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
                UpdateExpression: "ADD invoiceSequence :one",
                ExpressionAttributeValues: { ":one": 1 },
                ReturnValues: "UPDATED_NEW",
              })
            );

            const seq = updateSeqRes.Attributes?.invoiceSequence || 1;
            invoiceNumber = `INV-2026-${String(seq).padStart(4, "0")}`;

            // Calculate GST Tax splits (18% inclusive GST)
            const subtotal = Math.round((order.total / 1.18) * 100) / 100;
            const taxAmount = Math.round((order.total - subtotal) * 100) / 100;

            const storeState = (store.registeredState || "Karnataka").toLowerCase().trim();
            const customerState = (order.customerInfo?.shippingAddress?.state || "Karnataka").toLowerCase().trim();
            const taxType = storeState === customerState ? "intrastate" : "interstate";

            pdfBuffer = await generateInvoicePdf({
              invoiceNumber,
              date: new Date(order.createdAt).toLocaleDateString("en-IN"),
              storeName: store.registeredBusinessName || store.storeName,
              storeGstin: store.gstin,
              storeAddress: store.registeredBusinessAddress || "N/A",
              storeState: store.registeredState || "Karnataka",
              customerName: order.customerInfo.name,
              customerEmail: order.customerInfo.email,
              customerAddress: `${order.customerInfo.shippingAddress.addressLine1}, ${order.customerInfo.shippingAddress.city}, ${order.customerInfo.shippingAddress.postalCode}`,
              customerState: order.customerInfo.shippingAddress.state || "Karnataka",
              lineItems: order.lineItems || [],
              taxType,
              subtotal,
              taxAmount,
              total: order.total,
            });

            // Upload PDF to S3
            const s3Key = `tenants/${tenantId}/invoices/${orderId}-invoice.pdf`;
            await s3Client.send(
              new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3Key,
                Body: pdfBuffer,
                ContentType: "application/pdf",
              })
            );

            invoiceUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

            // Link invoice metadata back to the order record in DynamoDB
            await ddbDocClient.send(
              new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: `TENANT#${tenantId}`, SK: `ORDER#${orderId}` },
                UpdateExpression: "SET invoiceNumber = :invNum, invoiceUrl = :invUrl",
                ExpressionAttributeValues: {
                  ":invNum": invoiceNumber,
                  ":invUrl": invoiceUrl,
                },
              })
            );
            console.log(`` + `✅ GST Invoice generated & uploaded: ${invoiceNumber} (${invoiceUrl})`);
          } else {
            // PDF already exists. If buffer is missing, we regenerate it quickly for the email attachment
            const subtotal = Math.round((order.total / 1.18) * 100) / 100;
            const taxAmount = Math.round((order.total - subtotal) * 100) / 100;
            const storeState = (store.registeredState || "Karnataka").toLowerCase().trim();
            const customerState = (order.customerInfo?.shippingAddress?.state || "Karnataka").toLowerCase().trim();
            const taxType = storeState === customerState ? "intrastate" : "interstate";

            pdfBuffer = await generateInvoicePdf({
              invoiceNumber,
              date: new Date(order.createdAt).toLocaleDateString("en-IN"),
              storeName: store.registeredBusinessName || store.storeName,
              storeGstin: store.gstin,
              storeAddress: store.registeredBusinessAddress || "N/A",
              storeState: store.registeredState || "Karnataka",
              customerName: order.customerInfo.name,
              customerEmail: order.customerInfo.email,
              customerAddress: `${order.customerInfo.shippingAddress.addressLine1}, ${order.customerInfo.shippingAddress.city}, ${order.customerInfo.shippingAddress.postalCode}`,
              customerState: order.customerInfo.shippingAddress.state || "Karnataka",
              lineItems: order.lineItems || [],
              taxType,
              subtotal,
              taxAmount,
              total: order.total,
            });
          }
        }

        // Email dispatch with attachment (if pdfBuffer is present)
        if (pdfBuffer) {
          console.log(`Sending receipt with PDF invoice attachment to ${email}`);
          const mailOptions = {
            from: "noreply@basecart.io",
            to: email,
            subject: `Order Confirmation & GST Invoice - #${orderId.substring(0, 8).toUpperCase()}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #2563EB; margin: 0;">${store?.storeName || "Basecart"}</h1>
                  <p style="color: #64748B; margin: 5px 0 0 0;">Your Order is Confirmed</p>
                </div>
                <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px 0;">Hi ${order.customerInfo.name},</p>
                  <p style="margin: 0;">Thank you for shopping with us! Your payment has been successfully processed. Please find your GST tax invoice (PDF) attached to this email.</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E2E8F0;">Order ID</td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E2E8F0;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E2E8F0;">Invoice Number</td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E2E8F0;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E2E8F0;">Amount Paid</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10B981; border-bottom: 1px solid #E2E8F0;">₹${total}</td>
                  </tr>
                </table>
                <div style="font-size: 12px; color: #94A3B8; text-align: center;">
                  This is an automated email from ${store?.storeName || "Basecart"}. Please do not reply directly.
                </div>
              </div>
            `,
            attachments: [
              {
                filename: `invoice-${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          };

          const info = await new Promise<any>((resolve, reject) => {
            mailComposer.sendMail(mailOptions, (err, info) => {
              if (err) reject(err);
              else resolve(info);
            });
          });

          await sesClient.send(
            new SendRawEmailCommand({
              RawMessage: { Data: info.message },
            })
          );
          console.log(`✅ Raw confirmation email (with PDF attachment) sent successfully to ${email}`);
        } else {
          // Standard SES Email confirmation without attachment
          console.log(`Sending standard receipt email to ${email}`);
          const sendEmailCommand = new SendEmailCommand({
            Source: "noreply@basecart.io",
            Destination: { ToAddresses: [email] },
            Message: {
              Subject: { Data: `Order Confirmation - #${orderId.substring(0, 8).toUpperCase()}` },
              Body: {
                Html: {
                  Data: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #2563EB; margin: 0;">${store?.storeName || "Basecart"}</h1>
                        <p style="color: #64748B; margin: 5px 0 0 0;">Your Order is Confirmed</p>
                      </div>
                      <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0;">Hi,</p>
                        <p style="margin: 0;">Thank you for shopping with us! Your payment has been successfully processed.</p>
                      </div>
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E2E8F0;">Order ID</td>
                          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E2E8F0;">${orderId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E2E8F0;">Amount Paid</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10B981; border-bottom: 1px solid #E2E8F0;">₹${total}</td>
                        </tr>
                      </table>
                      <div style="font-size: 12px; color: #94A3B8; text-align: center;">
                        This is an automated email. Please do not reply directly.
                      </div>
                    </div>
                  `,
                },
              },
            },
          });

          await sesClient.send(sendEmailCommand);
          console.log(`✅ Standard confirmation email sent successfully to ${email}`);
        }
      }

      // 2. Handle WhatsApp Notification Jobs (Add-On 1)
      if (type === "WHATSAPP_NOTIFICATION") {
        const { recipient, recipientType, event } = body;

        // Fetch store metadata and order details
        const [storeRes, orderRes] = await Promise.all([
          ddbDocClient.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
            })
          ),
          ddbDocClient.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: { PK: `TENANT#${tenantId}`, SK: `ORDER#${orderId}` },
            })
          ),
        ]);

        const store = storeRes.Item;
        const order = orderRes.Item;

        if (!store || !order) {
          throw new Error("Store or Order not found during WhatsApp dispatch");
        }

        // Feature flag server-side check
        if (!store.addOns?.includes("whatsapp")) {
          console.log(`⚠️ WhatsApp add-on is disabled for store ${store.storeName}. Skipping message.`);
          continue;
        }

        // Formulate template body parameters
        let templateName = "";
        let parameters: Record<string, string> = {};
        let fallbackText = "";

        if (event === "ORDER_PLACED") {
          templateName = "customer_order_placed";
          parameters = {
            customerName: order.customerInfo.name,
            orderId: order.orderId,
            totalAmount: order.total.toString(),
          };
          fallbackText = `Hi ${order.customerInfo.name}, your order #${order.orderId.substring(
            0,
            8
          )} has been placed successfully! Amount Paid: Rs. ${order.total}. Thank you!`;
        } else if (event === "NEW_ORDER_RECEIVED") {
          templateName = "merchant_new_order";
          parameters = {
            storeName: store.storeName,
            orderId: order.orderId,
            totalAmount: order.total.toString(),
          };
          fallbackText = `New order received for ${store.storeName}! Order ID: #${order.orderId.substring(
            0,
            8
          )}, Total Amount: Rs. ${order.total}.`;
        } else if (event === "ORDER_SHIPPED") {
          templateName = "customer_order_shipped";
          parameters = {
            customerName: order.customerInfo.name,
            orderId: order.orderId,
            carrier: order.carrier || "Delivery Partner",
            trackingNumber: order.trackingNumber || "N/A",
          };
          fallbackText = `Hi ${order.customerInfo.name}, your order #${order.orderId.substring(
            0,
            8
          )} has been shipped via ${order.carrier || "our carrier"}. Tracking Number: ${
            order.trackingNumber || "N/A"
          }.`;
        } else if (event === "ORDER_DELIVERED") {
          templateName = "customer_order_delivered";
          parameters = {
            customerName: order.customerInfo.name,
            orderId: order.orderId,
          };
          fallbackText = `Hi ${order.customerInfo.name}, your order #${order.orderId.substring(
            0,
            8
          )} has been delivered successfully. Thank you for shopping with us!`;
        }

        if (templateName) {
          await sendWhatsAppMessage({
            to: recipient,
            templateName,
            parameters,
            fallbackText,
          });
        }
      }
    } catch (error) {
      console.error("❌ Failed to process SQS message record:", error, record.body);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures } as any;
};
