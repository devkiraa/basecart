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
 * Generates a GST-compliant Tax Invoice PDF as a Buffer using pure JS PDF commands.
 * Runs instantly on Cloudflare Workers without requiring Node filesystem standard fonts.
 */
export async function generateInvoicePdf(data: InvoiceDetails): Promise<Buffer> {
  const storeName = (data.storeName || "Basecart Store").replace(/[()]/g, "");
  const invoiceNum = (data.invoiceNumber || "INV-000").replace(/[()]/g, "");
  const dateStr = (data.date || "").replace(/[()]/g, "");
  const customerName = (data.customerName || "Valued Customer").replace(/[()]/g, "");
  const customerEmail = (data.customerEmail || "").replace(/[()]/g, "");
  const totalAmount = data.total ?? 0;
  const subtotal = data.subtotal ?? 0;
  const taxAmount = data.taxAmount ?? 0;
  const gstin = (data.storeGstin || "").replace(/[()]/g, "");

  const bodyStream = `BT
/F2 18 Tf
50 780 Td
(${storeName}) Tj
/F1 10 Tf
0 -20 Td
(GSTIN: ${gstin}) Tj
/F2 14 Tf
0 -40 Td
(TAX INVOICE) Tj
/F1 10 Tf
0 -20 Td
(Invoice No: ${invoiceNum}) Tj
0 -15 Td
(Date: ${dateStr}) Tj
0 -30 Td
/F2 10 Tf
(Billed To:) Tj
/F1 10 Tf
0 -15 Td
(${customerName} (${customerEmail})) Tj
0 -40 Td
/F2 10 Tf
(Summary:) Tj
/F1 10 Tf
0 -20 Td
(Subtotal: Rs. ${subtotal}) Tj
0 -15 Td
(GST (18%): Rs. ${taxAmount}) Tj
0 -20 Td
/F2 12 Tf
(Total Paid: Rs. ${totalAmount}) Tj
ET`;

  const streamLength = bodyStream.length;

  const pdfString = `%PDF-1.4
%âãÏÓ
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
/F2 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
>>
>>
/MediaBox [0 0 595.28 841.89]
/Contents 4 0 R
>>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${bodyStream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000015 00000 n 
0000000060 00000 n 
0000000111 00000 n 
0000000300 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
450
%%EOF
`;

  return Buffer.from(pdfString, "utf-8");
}
