import { getControlDb, getTenantDb } from "./lib/db";
import { generateInvoicePdf } from "./lib/pdf";
import { sendWhatsAppMessage } from "./services/whatsapp";
import { sendEmail } from "./services/email";
import { renderEmail, getEmailProvider } from "@basecart/emails";

export async function handleQueueBatch(batch: any, env: any, ctx: any): Promise<void> {
  console.log(`📥 Cloudflare Queue Job Processor triggered. Records count: ${batch.messages.length}`);

  for (const message of batch.messages) {
    try {
      const body = message.body;
      console.log("Processing Queue Job:", body);

      const { type, tenantId, orderId } = body;

      if (type === "ORDER_CONFIRMATION") {
        const { email, total } = body;

        const tenantDb = await getTenantDb(tenantId, env);

        // Idempotency: Verify that we have not already successfully sent confirmation for this order
        const lockKey = `email_sent_${orderId}`;
        try {
          await tenantDb
            .prepare("INSERT INTO idempotency_keys (key, status, response, createdAt) VALUES (?, ?, ?, ?)")
            .bind(lockKey, "COMPLETED", "{}", new Date().toISOString())
            .run();
        } catch (err: any) {
          console.log(`⚠️ Email for orderId ${orderId} was already sent. Skipping duplicate send.`);
          message.ack();
          continue;
        }

        const controlDb = getControlDb(env);

        // Fetch store settings from control DB
        const store = await controlDb
          .prepare("SELECT * FROM tenants WHERE tenantId = ?")
          .bind(tenantId)
          .first<any>();

        // Fetch order details from tenant DB
        const order = await tenantDb
          .prepare("SELECT * FROM orders WHERE orderId = ?")
          .bind(orderId)
          .first<any>();

        if (!order) {
          throw new Error(`Order ${orderId} not found in DB`);
        }

        let pdfBuffer: Buffer | undefined;
        let invoiceNumber = order.invoiceNumber;
        let invoiceUrl = order.invoiceUrl;

        let addOns = [];
        if (store?.addOns) {
          try {
            addOns = JSON.parse(store.addOns);
          } catch (e) {}
        }

        // Check if GST invoice add-on is active
        if (store && addOns.includes("gst_invoice") && store.gstin) {
          // If invoice does not exist yet, generate one
          if (!invoiceUrl) {
            // Atomic increment for sequential invoice numbering
            await tenantDb
              .prepare(
                "INSERT OR REPLACE INTO store_settings (key, value) VALUES ('invoiceSequence', CAST(COALESCE((SELECT value FROM store_settings WHERE key = 'invoiceSequence'), 0) as INTEGER) + 1)"
              )
              .run();

            const seqRow = await tenantDb
              .prepare("SELECT value FROM store_settings WHERE key = 'invoiceSequence'")
              .first<{ value: string }>();

            const seq = parseInt(seqRow?.value || "1");
            invoiceNumber = `INV-2026-${String(seq).padStart(4, "0")}`;

            // Calculate GST Tax splits (18% inclusive GST)
            const subtotal = Math.round((order.total / 1.18) * 100) / 100;
            const taxAmount = Math.round((order.total - subtotal) * 100) / 100;

            const storeState = (store.registeredState || "Karnataka").toLowerCase().trim();
            
            let customerState = "Karnataka";
            let customerAddress = "N/A";
            try {
              const addr = JSON.parse(order.shippingAddress);
              customerState = (addr.state || "Karnataka").toLowerCase().trim();
              customerAddress = `${addr.addressLine1 || ""}, ${addr.city || ""}, ${addr.postalCode || ""}`;
            } catch (e) {
              if (typeof order.shippingAddress === "string") {
                customerAddress = order.shippingAddress;
              }
            }

            const taxType = storeState === customerState ? "intrastate" : "interstate";

            // Fetch order items to pass to PDF generator
            const itemsRes = await tenantDb
              .prepare("SELECT * FROM order_items WHERE orderId = ?")
              .bind(orderId)
              .all();
            const orderItems = itemsRes.results || [];

            pdfBuffer = await generateInvoicePdf({
              invoiceNumber,
              date: new Date(order.createdAt).toLocaleDateString("en-IN"),
              storeName: store.registeredBusinessName || store.storeName,
              storeGstin: store.gstin,
              storeAddress: store.registeredBusinessAddress || "N/A",
              storeState: store.registeredState || "Karnataka",
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerAddress,
              customerState,
              lineItems: orderItems.map((item: any) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              taxType,
              subtotal,
              taxAmount,
              total: order.total,
            });

            // Upload PDF to R2 bucket
            const r2Key = `tenants/${tenantId}/invoices/${orderId}-invoice.pdf`;
            if (env.MEDIA_BUCKET) {
              await env.MEDIA_BUCKET.put(r2Key, pdfBuffer, { contentType: "application/pdf" });
            }

            const bucketName = env.S3_BUCKET || "basecart-media-bucket";
            if (env.NODE_ENV === "development" || env.AWS_ENDPOINT_URL) {
              const endpoint = env.AWS_ENDPOINT_URL || "http://localhost:4566";
              invoiceUrl = `${endpoint}/${bucketName}/${r2Key}`;
            } else {
              invoiceUrl = `https://${bucketName}.r2.cloudflarestorage.com/${r2Key}`;
            }

            // Link invoice metadata back to the order record in D1
            await tenantDb
              .prepare("UPDATE orders SET invoiceNumber = ?, invoiceUrl = ? WHERE orderId = ?")
              .bind(invoiceNumber, invoiceUrl, orderId)
              .run();

            console.log(`✅ GST Invoice generated & uploaded: ${invoiceNumber} (${invoiceUrl})`);
          } else {
            // PDF already exists. If buffer is missing, we regenerate it quickly for the email attachment
            const subtotal = Math.round((order.total / 1.18) * 100) / 100;
            const taxAmount = Math.round((order.total - subtotal) * 100) / 100;
            const storeState = (store.registeredState || "Karnataka").toLowerCase().trim();
            
            let customerState = "Karnataka";
            let customerAddress = "N/A";
            try {
              const addr = JSON.parse(order.shippingAddress);
              customerState = (addr.state || "Karnataka").toLowerCase().trim();
              customerAddress = `${addr.addressLine1 || ""}, ${addr.city || ""}, ${addr.postalCode || ""}`;
            } catch (e) {
              if (typeof order.shippingAddress === "string") {
                customerAddress = order.shippingAddress;
              }
            }

            const taxType = storeState === customerState ? "intrastate" : "interstate";

            // Fetch order items to pass to PDF generator
            const itemsRes = await tenantDb
              .prepare("SELECT * FROM order_items WHERE orderId = ?")
              .bind(orderId)
              .all();
            const orderItems = itemsRes.results || [];

            pdfBuffer = await generateInvoicePdf({
              invoiceNumber,
              date: new Date(order.createdAt).toLocaleDateString("en-IN"),
              storeName: store.registeredBusinessName || store.storeName,
              storeGstin: store.gstin,
              storeAddress: store.registeredBusinessAddress || "N/A",
              storeState: store.registeredState || "Karnataka",
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerAddress,
              customerState,
              lineItems: orderItems.map((item: any) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              taxType,
              subtotal,
              taxAmount,
              total: order.total,
            });
          }
        }

        const attachments = pdfBuffer
          ? [
              {
                content: pdfBuffer.toString("base64"),
                filename: `invoice-${invoiceNumber}.pdf`,
              },
            ]
          : undefined;

        await sendEmail(
          {
            type: "order-confirmation",
            to: email,
            data: {
              orderId,
              customerName: order.customerName,
              total,
              invoiceNumber,
              attachments,
              storeName: store?.storeName || "Basecart",
            },
          },
          env
        );
      }

      if (type === "WHATSAPP_NOTIFICATION") {
        const { recipient, event } = body;

        const controlDb = getControlDb(env);
        const store = await controlDb
          .prepare("SELECT * FROM tenants WHERE tenantId = ?")
          .bind(tenantId)
          .first<any>();

        const tenantDb = await getTenantDb(tenantId, env);
        const order = await tenantDb
          .prepare("SELECT * FROM orders WHERE orderId = ?")
          .bind(orderId)
          .first<any>();

        if (!store || !order) {
          throw new Error("Store or Order not found during WhatsApp dispatch");
        }

        let addOns = [];
        if (store.addOns) {
          try {
            addOns = JSON.parse(store.addOns);
          } catch (e) {}
        }

        if (!addOns.includes("whatsapp")) {
          console.log(`⚠️ WhatsApp add-on is disabled for store ${store.storeName}. Skipping message.`);
          message.ack();
          continue;
        }

        let templateName = "";
        let parameters: Record<string, string> = {};
        let fallbackText = "";

        if (event === "ORDER_PLACED") {
          templateName = "customer_order_placed";
          parameters = {
            customerName: order.customerName,
            orderId: order.orderId,
            totalAmount: order.total.toString(),
          };
          fallbackText = `Hi ${order.customerName}, your order #${order.orderId.substring(
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
            customerName: order.customerName,
            orderId: order.orderId,
            carrier: order.carrier || "Delivery Partner",
            trackingNumber: order.trackingNumber || "N/A",
          };
          fallbackText = `Hi ${order.customerName}, your order #${order.orderId.substring(
            0,
            8
          )} has been shipped via ${order.carrier || "our carrier"}. Tracking Number: ${
            order.trackingNumber || "N/A"
          }.`;
        } else if (event === "ORDER_DELIVERED") {
          templateName = "customer_order_delivered";
          parameters = {
            customerName: order.customerName,
            orderId: order.orderId,
          };
          fallbackText = `Hi ${order.customerName}, your order #${order.orderId.substring(
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
      if (type === "TRANSACTIONAL_EMAIL") {
        const { emailPayload } = body;
        const { type: emailType, to, data, from } = emailPayload;

        const startTime = Date.now();
        let status = "success";
        let providerResponse = "";
        let errorMessage = "";

        try {
          const { subject, html, text } = renderEmail(emailType, data);
          const provider = getEmailProvider(env);
          const res = await provider.send(
            to,
            subject,
            html,
            text,
            data.attachments,
            from
          );

          if (!res.success) {
            status = "failed";
            errorMessage = res.error || "Unknown error";
          } else {
            providerResponse = res.messageId || "success";
          }
        } catch (err: any) {
          status = "error";
          errorMessage = err.message || String(err);
          console.error("❌ Email processing threw exception:", err);
        } finally {
          const duration = Date.now() - startTime;
          try {
            const controlDb = getControlDb(env);
            await controlDb
              .prepare(
                "INSERT INTO email_logs (logId, recipient, template, status, providerResponse, timestamp, duration, errorMessage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
              )
              .bind(
                crypto.randomUUID(),
                to,
                emailType,
                status,
                providerResponse,
                new Date().toISOString(),
                duration,
                errorMessage || null
              )
              .run();
          } catch (logErr) {
            console.error("❌ Failed to write email log to D1:", logErr);
          }
        }
      }

      message.ack();
    } catch (err: any) {
      console.error("❌ Failed to process Cloudflare Queue message record:", err, message.body);
    }
  }
}
