import React from 'react';

interface ThermalProps {
  invoice: any;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
}

// ─────────────────────────────────────────────────────────────
// Helper: Generate a complete standalone HTML page for thermal print
// Opens in new window and auto-prints (works independent of React)
// ─────────────────────────────────────────────────────────────
export function generateThermalPrintHTML(
  invoice: any,
  shopName: string,
  shopAddress: string,
  shopPhone: string
): string {
  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const billNo = invoice.invoiceNo;

  // Build items rows
  const itemRows = invoice.items
    .map((item: any, i: number) => {
      const qty = `${item.proof || item.quantity} ${item.unit}`;
      const rate = Number(item.rate).toFixed(2);
      const amt = Number(item.amount).toFixed(2);
      return `
      <tr>
        <td class="sr">${i + 1}</td>
        <td class="name">${item.nameHindi || item.name}</td>
        <td class="center">${qty}</td>
        <td class="right">${rate}</td>
        <td class="right amt">${amt}</td>
      </tr>`;
    })
    .join('');

  const gstRow =
    invoice.gstRate > 0
      ? `<tr class="total-row">
          <td colspan="4" class="right">GST (${invoice.gstRate}%)</td>
          <td class="right">&#8377;${Number(invoice.gstAmount).toFixed(2)}</td>
        </tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${shopName} - ${billNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap" rel="stylesheet" />
  <style>
    /* ── Page Setup ─────────────────────────────────── */
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 80mm;
      font-family: 'Courier New', 'Noto Sans Devanagari', monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
    }

    .receipt {
      width: 74mm;
      margin: 0 auto;
      padding: 5mm 2mm;
    }

    /* ── Header ─────────────────────────────────────── */
    .shop-name {
      font-family: 'Noto Sans Devanagari', sans-serif;
      text-align: center;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin-bottom: 1.5mm;
      line-height: 1.2;
    }
    .shop-sub {
      text-align: center;
      font-size: 11px;
      margin-bottom: 0.8mm;
    }

    /* ── Dividers ────────────────────────────────────── */
    .div-dash { border-top: 1px dashed #000; margin: 2.5mm 0; }
    .div-solid { border-top: 1px solid #000; margin: 2mm 0; }
    .div-double {
      border-top: 3px double #000;
      margin: 2.5mm 0;
    }

    /* ── Bill Meta ───────────────────────────────────── */
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 1.5mm;
    }
    .meta-label { font-weight: bold; }
    .customer-block { 
      font-size: 11.5px; 
      margin-bottom: 1.5mm;
      border-left: 2px solid #000;
      padding-left: 2mm;
    }

    /* ── Items Table ─────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    thead tr {
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    thead th {
      padding: 1.5mm 0.5mm;
      font-weight: bold;
      font-size: 11px;
    }
    tbody tr { border-bottom: none; }
    tbody td { padding: 1.5mm 0.5mm; vertical-align: top; }

    .sr   { width: 8%; text-align: center; }
    .name { width: 40%; font-weight: bold; }
    .center { width: 20%; text-align: center; }
    .right  { text-align: right; }
    .amt    { width: 20%; font-weight: 700; }

    /* ── Totals ──────────────────────────────────────── */
    .totals-table { width: 100%; font-size: 11.5px; margin-top: 1mm; }
    .total-row td { padding: 1mm 0.5mm; }
    .grand-total-row td {
      font-size: 15px;
      font-weight: 900;
      padding: 2.5mm 0.5mm;
    }

    /* ── Footer ──────────────────────────────────────── */
    .footer {
      text-align: center;
      margin-top: 5mm;
      font-size: 12px;
    }
    .footer .hindi {
      font-family: 'Noto Sans Devanagari', sans-serif;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    .footer .english {
      font-size: 11px;
      letter-spacing: 1px;
      margin-top: 1.5mm;
      font-weight: bold;
    }
  </style>
</head>
<body>
<div class="receipt">

  <!-- SHOP HEADER -->
  <div class="shop-name">${shopName}</div>
  <div class="shop-sub">${shopAddress}</div>
  <div class="shop-sub">Tel: ${shopPhone}</div>

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
        <th class="right">दर</th>
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
        <td colspan="4" class="right">एकूण (Subtotal)</td>
        <td class="right">&#8377;${Number(invoice.subtotal).toFixed(2)}</td>
      </tr>
      ${gstRow}
    </tbody>
  </table>

  <div class="div-double"></div>

  <table class="totals-table">
    <tbody>
      <tr class="grand-total-row">
        <td colspan="4" class="right">एकूण रक्कम &#10003;</td>
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
export const InvoiceThermal = ({ invoice, shopName, shopAddress, shopPhone }: ThermalProps) => {
  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const tdStyle: React.CSSProperties = { padding: '1px 3px', verticalAlign: 'top' };
  const rightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right' };
  const centerStyle: React.CSSProperties = { ...tdStyle, textAlign: 'center' };

  return (
    <div style={{
      fontFamily: "'Courier New', 'Noto Sans Devanagari', monospace",
      fontSize: '13px',
      lineHeight: '1.4',
      width: '76mm',
      color: '#000',
      background: '#fff',
      padding: '5mm 2mm',
      border: '1px solid #eee',
    }}>
      {/* Shop Header */}
      <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '18px', fontFamily: "'Noto Sans Devanagari', sans-serif", marginBottom: '3px' }}>
        {shopName}
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '2px' }}>{shopAddress}</div>
      <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '5px' }}>Tel: {shopPhone}</div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Bill Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
        <span><b>Date:</b> {dateStr}</span>
        <span><b>Bill#:</b> {invoice.invoiceNo}</span>
      </div>
      {invoice.customerName && (
        <div style={{ fontSize: '11.5px', marginBottom: '3px', borderLeft: '2px solid #000', paddingLeft: '5px' }}>
          <b>ग्राहक:</b> {invoice.customerName}
          {invoice.phone && <span> | <b>Mob:</b> {invoice.phone}</span>}
        </div>
      )}

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
            <th style={{ ...tdStyle, width: '8%', textAlign: 'center', fontWeight: 'bold' }}>#</th>
            <th style={{ ...tdStyle, width: '40%', fontWeight: 'bold' }}>तपशील</th>
            <th style={{ ...centerStyle, width: '20%', fontWeight: 'bold' }}>प्रमाण</th>
            <th style={{ ...rightStyle, fontWeight: 'bold' }}>दर</th>
            <th style={{ ...rightStyle, width: '20%', fontWeight: 'bold' }}>रक्कम</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: any, i: number) => (
            <tr key={item.id}>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{i + 1}</td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>{item.nameHindi || item.name}</td>
              <td style={centerStyle}>{item.proof || item.quantity} {item.unit}</td>
              <td style={rightStyle}>{Number(item.rate).toFixed(2)}</td>
              <td style={{ ...rightStyle, fontWeight: 700 }}>{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid #000', margin: '6px 0' }} />

      {/* Totals */}
      <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ ...rightStyle }} colSpan={4}>एकूण (Subtotal)</td>
            <td style={rightStyle}>₹{Number(invoice.subtotal).toFixed(2)}</td>
          </tr>
          {invoice.gstRate > 0 && (
            <tr>
              <td style={{ ...rightStyle }} colSpan={4}>GST ({invoice.gstRate}%)</td>
              <td style={rightStyle}>₹{Number(invoice.gstAmount).toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ borderTop: '3px double #000', margin: '6px 0' }} />

      {/* Grand Total */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ ...rightStyle, fontWeight: 900, fontSize: '16px' }} colSpan={4}>एकूण रक्कम ✓</td>
            <td style={{ ...rightStyle, fontWeight: 900, fontSize: '16px' }}>₹{Number(invoice.grandTotal).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: 900, fontSize: '14px' }}>
          धन्यवाद ! पुन्हा भेट द्या !
        </div>
        <div style={{ fontSize: '11px', letterSpacing: '1px', marginTop: '3px', fontWeight: 'bold' }}>
          ** THANK YOU • VISIT AGAIN **
        </div>
      </div>
    </div>
  );
};
