import React from 'react';

interface ThermalProps {
  invoice: any;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  logoUrl?: string;
  gstNumber?: string;
  fssaiNumber?: string;
}

// ─────────────────────────────────────────────────────────────
// Helper: Generate a complete standalone HTML page for thermal print
// Opens in new window and auto-prints (works independent of React)
// ─────────────────────────────────────────────────────────────
export function generateThermalPrintHTML(
  invoice: any,
  shopName: string,
  shopAddress: string,
  shopPhone: string,
  logoUrl?: string,
  gstNumber?: string,
  fssaiNumber?: string
): string {
  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const billNo = invoice.invoiceNo;

  // Build items rows without 'दर' (Rate) column
  const itemRows = invoice.items
    .map((item: any, i: number) => {
      const qty = `${item.proof || item.quantity} ${item.unit}`;
      const amt = Number(item.amount).toFixed(2);
      return `
      <tr>
        <td class="sr">${i + 1}</td>
        <td class="name">${item.nameHindi || item.name}</td>
        <td class="center">${qty}</td>
        <td class="right amt">${amt}</td>
      </tr>`;
    })
    .join('');

  const gstRow =
    invoice.gstRate > 0
      ? `<tr class="total-row">
          <td colspan="3" class="right">GST (${invoice.gstRate}%)</td>
          <td class="right">&#8377;${Number(invoice.gstAmount).toFixed(2)}</td>
        </tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8" />
  <base href="${typeof window !== 'undefined' ? window.location.origin : ''}/" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${shopName} - ${billNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    /* ── Page Setup ─────────────────────────────────── */
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 80mm;
      font-family: 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #000;
      background: #fff;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
    }

    .receipt {
      width: 76mm;
      margin: 0 auto;
      padding: 4mm 1.5mm;
    }

    /* ── Header ─────────────────────────────────────── */
    .shop-name {
      font-family: 'Noto Sans Devanagari', sans-serif;
      text-align: center;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-bottom: 1.5mm;
      line-height: 1.2;
      color: #000;
    }
    .logo-img {
      width: 42mm;
      margin: 0 auto 2mm auto;
      display: block;
      object-fit: contain;
      filter: grayscale(100%) contrast(200%);
    }
    .shop-sub {
      text-align: center;
      font-size: 12.5px;
      font-weight: 700;
      margin-bottom: 1mm;
      color: #000;
      line-height: 1.3;
    }

    /* ── Dividers ────────────────────────────────────── */
    .div-dash { border-top: 1.5px dashed #000; margin: 2.5mm 0; }
    .div-solid { border-top: 1.5px solid #000; margin: 2mm 0; }
    .div-double {
      border-top: 3px double #000;
      margin: 2.5mm 0;
    }

    /* ── Bill Meta ───────────────────────────────────── */
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 700;
      color: #000;
      margin-bottom: 1.5mm;
    }
    .meta-label { font-weight: 800; }
    .customer-block { 
      font-size: 13px; 
      font-weight: 700;
      color: #000;
      margin-bottom: 1.5mm;
      border-left: 2.5px solid #000;
      padding-left: 2mm;
    }

    /* ── Items Table ─────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      color: #000;
    }
    thead tr {
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
    }
    thead th {
      padding: 2mm 0.5mm;
      font-weight: 800;
      font-size: 13px;
      color: #000;
    }
    tbody tr { border-bottom: none; }
    tbody td { padding: 1.5mm 0.5mm; vertical-align: top; }

    .sr   { width: 8%; text-align: center; font-weight: 700; }
    .name { width: 52%; font-weight: 800; word-break: break-word; }
    .center { width: 20%; text-align: center; font-weight: 700; }
    .right  { text-align: right; }
    .amt    { width: 20%; font-weight: 800; }

    /* ── Totals ──────────────────────────────────────── */
    .totals-table { width: 100%; font-size: 13.5px; font-weight: 700; margin-top: 1mm; }
    .total-row td { padding: 1mm 0.5mm; }
    .grand-total-row td {
      font-size: 17px;
      font-weight: 900;
      padding: 2.5mm 0.5mm;
      color: #000;
    }

    /* ── Footer ──────────────────────────────────────── */
    .footer {
      text-align: center;
      margin-top: 4mm;
      font-size: 13px;
      color: #000;
    }
    .footer .hindi {
      font-family: 'Noto Sans Devanagari', sans-serif;
      font-weight: 900;
      font-size: 15px;
      letter-spacing: 0.5px;
    }
    .footer .english {
      font-size: 12px;
      letter-spacing: 1px;
      margin-top: 1.5mm;
      font-weight: 800;
    }
  </style>
</head>
<body>
<div class="receipt">

  <!-- SHOP HEADER -->
  ${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo" />` : ''}
  <div class="shop-name">${shopName}</div>
  <div class="shop-sub">${shopAddress}</div>
  <div class="shop-sub">Tel: ${shopPhone}</div>
  ${gstNumber ? `<div class="shop-sub">GST: ${gstNumber}</div>` : ''}
  ${fssaiNumber ? `<div class="shop-sub">FSSAI: ${fssaiNumber}</div>` : ''}

  <div class="div-dash"></div>

  <!-- BILL META -->
  <div class="meta-row">
    <span><span class="meta-label">Date:</span> ${dateStr}</span>
    <span><span class="meta-label">Bill#:</span> ${billNo}</span>
  </div>

  ${
    invoice.customerName
      ? `<div class="customer-block">
      <span class="meta-label">ग्राहक:</span> ${invoice.customerName}
      ${invoice.phone ? `&nbsp;|&nbsp;<span class="meta-label">Mob:</span> ${invoice.phone}` : ''}
    </div>`
      : ''
  }

  <div class="div-dash"></div>

  <!-- ITEMS -->
  <table>
    <thead>
      <tr>
        <th class="sr">#</th>
        <th class="name">तपशील</th>
        <th class="center">प्रमाण</th>
        <th class="right amt">रक्कम</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="div-solid"></div>

  <!-- TOTALS -->
  <table class="totals-table">
    <tbody>
      <tr class="total-row">
        <td colspan="3" class="right">एकूण (Subtotal)</td>
        <td class="right">&#8377;${Number(invoice.subtotal).toFixed(2)}</td>
      </tr>
      ${gstRow}
    </tbody>
  </table>

  <div class="div-double"></div>

  <table class="totals-table">
    <tbody>
      <tr class="grand-total-row">
        <td colspan="3" class="right">एकूण रक्कम &#10003;</td>
        <td class="right">&#8377;${Number(invoice.grandTotal).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="div-dash"></div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="hindi">धन्यवाद ! पुन्हा भेट द्या !</div>
    <div class="english">** THANK YOU • VISIT AGAIN **</div>
  </div>

</div>

<script>
  // Auto print when fonts are ready
  document.fonts.ready.then(function() {
    window.print();
    window.onafterprint = function() { window.close(); };
  });
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// React Preview Component (on-screen display only)
// ─────────────────────────────────────────────────────────────
export const InvoiceThermal = ({ invoice, shopName, shopAddress, shopPhone, logoUrl, gstNumber, fssaiNumber }: ThermalProps) => {
  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const tdStyle: React.CSSProperties = { padding: '2px 3px', verticalAlign: 'top', color: '#000' };
  const rightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right' };
  const centerStyle: React.CSSProperties = { ...tdStyle, textAlign: 'center' };

  return (
    <div style={{
      fontFamily: "'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
      fontSize: '13px',
      fontWeight: 700,
      lineHeight: '1.35',
      width: '76mm',
      color: '#000',
      background: '#fff',
      padding: '4mm 1.5mm',
      border: '1px solid #ddd',
    }}>
      {/* Shop Header */}
      {logoUrl && (
        <img src={logoUrl} style={{ width: '42mm', margin: '0 auto 2px auto', display: 'block', objectFit: 'contain', filter: 'grayscale(100%) contrast(200%)' }} alt="Logo" />
      )}
      <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '20px', fontFamily: "'Noto Sans Devanagari', sans-serif", marginBottom: '3px', color: '#000' }}>
        {shopName}
      </div>
      <div style={{ textAlign: 'center', fontSize: '12.5px', fontWeight: 700, marginBottom: '2px', color: '#000' }}>{shopAddress}</div>
      <div style={{ textAlign: 'center', fontSize: '12.5px', fontWeight: 700, marginBottom: '2px', color: '#000' }}>Tel: {shopPhone}</div>
      {gstNumber && <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, marginBottom: '2px', color: '#000' }}>GST: {gstNumber}</div>}
      {fssaiNumber && <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, marginBottom: '5px', color: '#000' }}>FSSAI: {fssaiNumber}</div>}

      <div style={{ borderTop: '1.5px dashed #000', margin: '6px 0' }} />

      {/* Bill Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#000', marginBottom: '3px' }}>
        <span><b style={{ fontWeight: 800 }}>Date:</b> {dateStr}</span>
        <span><b style={{ fontWeight: 800 }}>Bill#:</b> {invoice.invoiceNo}</span>
      </div>
      {invoice.customerName && (
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#000', marginBottom: '3px', borderLeft: '2.5px solid #000', paddingLeft: '5px' }}>
          <b style={{ fontWeight: 800 }}>ग्राहक:</b> {invoice.customerName}
          {invoice.phone && <span> | <b style={{ fontWeight: 800 }}>Mob:</b> {invoice.phone}</span>}
        </div>
      )}

      <div style={{ borderTop: '1.5px dashed #000', margin: '6px 0' }} />

      {/* Items Table - No 'दर' (Rate) column */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
        <thead>
          <tr style={{ borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>
            <th style={{ ...tdStyle, width: '8%', textAlign: 'center', fontWeight: 800 }}>#</th>
            <th style={{ ...tdStyle, width: '52%', fontWeight: 800, textAlign: 'left' }}>तपशील</th>
            <th style={{ ...centerStyle, width: '20%', fontWeight: 800 }}>प्रमाण</th>
            <th style={{ ...rightStyle, width: '20%', fontWeight: 800 }}>रक्कम</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: any, i: number) => (
            <tr key={item.id || i}>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{i + 1}</td>
              <td style={{ ...tdStyle, fontWeight: 800, wordBreak: 'break-word' }}>{item.nameHindi || item.name}</td>
              <td style={{ ...centerStyle, fontWeight: 700 }}>{item.proof || item.quantity} {item.unit}</td>
              <td style={{ ...rightStyle, fontWeight: 800 }}>{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1.5px solid #000', margin: '6px 0' }} />

      {/* Totals */}
      <table style={{ width: '100%', fontSize: '13.5px', fontWeight: 700, borderCollapse: 'collapse', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...rightStyle }} colSpan={3}>एकूण (Subtotal)</td>
            <td style={rightStyle}>₹{Number(invoice.subtotal).toFixed(2)}</td>
          </tr>
          {invoice.gstRate > 0 && (
            <tr>
              <td style={{ ...rightStyle }} colSpan={3}>GST ({invoice.gstRate}%)</td>
              <td style={rightStyle}>₹{Number(invoice.gstAmount).toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ borderTop: '3px double #000', margin: '6px 0' }} />

      {/* Grand Total */}
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...rightStyle, fontWeight: 900, fontSize: '17px' }} colSpan={3}>एकूण रक्कम ✓</td>
            <td style={{ ...rightStyle, fontWeight: 900, fontSize: '17px' }}>₹{Number(invoice.grandTotal).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: '1.5px dashed #000', margin: '8px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '6px', color: '#000' }}>
        <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: 900, fontSize: '15px' }}>
          धन्यवाद ! पुन्हा भेट द्या !
        </div>
        <div style={{ fontSize: '12px', letterSpacing: '1px', marginTop: '3px', fontWeight: 800 }}>
          ** THANK YOU • VISIT AGAIN **
        </div>
      </div>
    </div>
  );
};
