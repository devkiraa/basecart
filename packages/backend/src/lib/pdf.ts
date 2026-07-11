import PDFDocument from "pdfkit";

export interface InvoiceDetails {
  invoiceNumber: string;
  date: string;
  storeName: string;
  storeGstin: string;
  storeAddress: string;
  storeState: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerState: string;
  lineItems: Array<{ name: string; price: number; quantity: number }>;
  taxType: "intrastate" | "interstate";
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Generates a GST-compliant Tax Invoice PDF as a Buffer using pdfkit.
 */
export async function generateInvoicePdf(data: InvoiceDetails): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // 1. Title / Header Block
      doc
        .fillColor("#2563eb")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(data.storeName, 50, 50, { align: "left" });

      doc
        .fillColor("#475569")
        .fontSize(10)
        .font("Helvetica")
        .text("TAX INVOICE", 400, 55, { align: "right" });

      doc.moveDown(1.5);

      // Draw thin top line
      doc
        .moveTo(50, 85)
        .lineTo(540, 85)
        .strokeColor("#e2e8f0")
        .stroke();

      doc.moveDown(2);

      // 2. Invoice Metadata and Seller Details
      const yStart = doc.y;
      doc
        .fillColor("#1e293b")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Billed By (Seller):", 50, yStart)
        .font("Helvetica")
        .text(data.storeName)
        .text(`GSTIN: ${data.storeGstin}`)
        .text(data.storeAddress)
        .text(`State: ${data.storeState}`);

      doc
        .font("Helvetica-Bold")
        .text("Invoice Details:", 350, yStart)
        .font("Helvetica")
        .text(`Invoice No: ${data.invoiceNumber}`)
        .text(`Date: ${data.date}`)
        .text(`State of Supply: ${data.customerState}`);

      doc.moveDown(2);

      // 3. Customer Details
      const customerY = doc.y;
      doc
        .font("Helvetica-Bold")
        .text("Billed To (Buyer):", 50, customerY)
        .font("Helvetica")
        .text(data.customerName)
        .text(data.customerEmail)
        .text(data.customerAddress)
        .text(`State: ${data.customerState}`);

      doc.moveDown(2);

      // 4. Line Items Table Header
      const tableTop = doc.y;
      doc
        .font("Helvetica-Bold")
        .text("Item Description", 50, tableTop)
        .text("Qty", 300, tableTop, { width: 50, align: "right" })
        .text("Price (INR)", 370, tableTop, { width: 70, align: "right" })
        .text("Amount (INR)", 450, tableTop, { width: 90, align: "right" });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(540, tableTop + 15)
        .strokeColor("#cbd5e1")
        .stroke();

      doc.font("Helvetica");

      // 5. Line Items Rows
      let itemY = tableTop + 25;
      for (const item of data.lineItems) {
        doc
          .text(item.name, 50, itemY)
          .text(item.quantity.toString(), 300, itemY, { width: 50, align: "right" })
          .text(item.price.toFixed(2), 370, itemY, { width: 70, align: "right" })
          .text((item.price * item.quantity).toFixed(2), 450, itemY, { width: 90, align: "right" });
        itemY += 20;
      }

      doc
        .moveTo(50, itemY)
        .lineTo(540, itemY)
        .strokeColor("#e2e8f0")
        .stroke();

      // 6. Summary block
      const summaryY = itemY + 15;
      doc
        .text("Subtotal:", 300, summaryY, { width: 140, align: "right" })
        .text(data.subtotal.toFixed(2), 450, summaryY, { width: 90, align: "right" });

      const taxLabel = data.taxType === "intrastate"
        ? `CGST (9%) + SGST (9%):`
        : `IGST (18%):`;

      doc
        .text(taxLabel, 300, summaryY + 18, { width: 140, align: "right" })
        .text(data.taxAmount.toFixed(2), 450, summaryY + 18, { width: 90, align: "right" });

      doc
        .font("Helvetica-Bold")
        .text("Total Paid:", 300, summaryY + 38, { width: 140, align: "right" })
        .text(data.total.toFixed(2), 450, summaryY + 38, { width: 90, align: "right" });

      // 7. Footer
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .font("Helvetica-Oblique")
        .text("This is an electronically generated tax invoice. No signature is required.", 50, 720, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
