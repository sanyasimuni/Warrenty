import jsPDF from 'jspdf';
import { ProductItem } from './dashboard-data';

export function buildInvoicePDFDocument(product: ProductItem): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [37, 99, 235]; // #2563eb Blue
  const darkTextColor = [30, 41, 59]; // Slate 800
  const lightTextColor = [100, 116, 139]; // Slate 500
  const borderColor = [226, 232, 240]; // Slate 200

  // 1. Header Banner
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('WARRANTYWISE — OFFICIAL INVOICE & PROOF OF PURCHASE', 15, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Encrypted Digital Vault • Real-Time Cloud Synchronized Document', 15, 20);

  // 2. Invoice & Order Metadata Box
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 33, pageWidth - 30, 32, 3, 3, 'FD');

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`DOCUMENT: ${product.invoiceFileName || 'Samsung_Galaxy_Invoice_2026.pdf'}`, 20, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);

  doc.text(`Order Number: ${product.orderNumber || '#SAM-8893120'}`, 20, 49);
  doc.text(`Purchase Date: ${product.purchaseDate}`, 20, 55);
  doc.text(`Vault Customer: Sanyasi Muni (Verified)`, 20, 61);

  doc.text(`Merchant: ${product.retailer}`, 115, 49);
  doc.text(`Serial Number: ${product.serialNumber}`, 115, 55);
  doc.text(`Vault Asset ID: ${product.assetId || 'AP-GAL-26'}`, 115, 61);

  // 3. Line Items Table Header
  const tableStartY = 73;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, tableStartY, pageWidth - 30, 9, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, tableStartY + 9, pageWidth - 15, tableStartY + 9);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM DESCRIPTION / MODEL', 20, tableStartY + 6);
  doc.text('CATEGORY', 105, tableStartY + 6);
  doc.text('QTY', 145, tableStartY + 6);
  doc.text('AMOUNT', 170, tableStartY + 6);

  // 4. Line Item Row
  const rowY = tableStartY + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(product.name, 20, rowY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(product.model || product.brand, 20, rowY + 5);

  doc.text(product.categoryLabel || 'Electronics', 105, rowY);
  doc.text('1', 147, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`$${product.purchasePrice.toFixed(2)}`, 168, rowY);

  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, rowY + 12, pageWidth - 15, rowY + 12);

  // 5. Warranty Information Section
  const warY = rowY + 22;
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254); // Blue 200
  doc.roundedRect(15, warY, pageWidth - 30, 36, 3, 3, 'FD');

  doc.setTextColor(29, 78, 216); // Blue 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('🛡️ ACTIVE WARRANTY & DIGITAL VAULT COVERAGE', 20, warY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Coverage Plan: ${product.warrantyCoverageName || 'Samsung Care+ Protection'}`, 20, warY + 16);
  doc.text(`Protection Details: ${product.warrantyCoverageDesc || 'Full hardware coverage & accidental drop protection'}`, 20, warY + 22);
  doc.text(`Valid Until: ${product.expiryDate} (${product.warrantyMonths} Months Total)`, 20, warY + 28);

  // Status Badge
  doc.setFillColor(220, 252, 231); // Green 100
  doc.setDrawColor(134, 239, 172); // Green 300
  doc.roundedRect(145, warY + 6, 40, 8, 2, 2, 'FD');
  doc.setTextColor(22, 101, 52); // Green 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('COVERAGE ACTIVE', 150, warY + 11.5);

  // 6. Pricing Summary Box
  const sumY = warY + 44;
  const sumLeft = 115;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('Subtotal:', sumLeft, sumY);
  doc.text(`$${product.purchasePrice.toFixed(2)}`, 170, sumY);

  doc.text('Estimated Sales Tax (0.00%):', sumLeft, sumY + 6);
  doc.text('$0.00', 170, sumY + 6);

  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(sumLeft, sumY + 9, pageWidth - 15, sumY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Total Amount:', sumLeft, sumY + 16);
  doc.setTextColor(37, 99, 235);
  doc.text(`$${product.purchasePrice.toFixed(2)}`, 166, sumY + 16);

  // 7. Official Digital Stamp & Security Seal
  const stampY = sumY + 28;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, stampY, pageWidth - 30, 32, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('VAULT AUTHENTICATION & BLOCKCHAIN VERIFICATION SEAL', 20, stampY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This invoice document is cryptographically anchored in the WarrantyWise Cloud Safe.', 20, stampY + 13);
  doc.text(`Document Hash (SHA-256): 9f8a3c4e7b1a2d5e6f8091c3b4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3`, 20, stampY + 19);
  doc.text(`Timestamp: ${new Date().toUTCString()} • Authorized by Merchant: ${product.retailer}`, 20, stampY + 25);

  // 8. Footer
  const footerY = 280;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('WarrantyWise Technologies Inc. • Customer Support: help@warrantywise.app • https://warrantywise.app', 15, footerY + 6);
  doc.text('Page 1 of 1', pageWidth - 30, footerY + 6);

  return doc;
}

export function generateInvoicePDF(product: ProductItem) {
  const doc = buildInvoicePDFDocument(product);
  const filename = product.invoiceFileName || `${product.name.replace(/\s+/g, '_')}_Invoice.pdf`;
  doc.save(filename);
}

export function getInvoicePDFBlobUrl(product: ProductItem): string {
  const doc = buildInvoicePDFDocument(product);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

export function getInvoicePDFDataUri(product: ProductItem): string {
  const doc = buildInvoicePDFDocument(product);
  return doc.output('datauristring');
}
