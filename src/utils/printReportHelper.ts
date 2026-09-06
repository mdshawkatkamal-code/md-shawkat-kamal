/**
 * printReportHelper.ts
 * Reliable print helper for generating standalone printable documents
 * that work seamlessly even inside sandboxed iframes.
 */

export interface PrintDocumentData {
  title: string;
  subtitle?: string;
  propertyName: string;
  propertyAddress: string;
  propertyPhone?: string;
  propertyEmail?: string;
  reportDate: string;
  referenceNo: string;
  preparedBy: string;
  summaryMetrics?: { label: string; value: string; color?: string }[];
  tableHeaders: string[];
  tableAlignments?: ('left' | 'center' | 'right')[];
  tableRows: (string | number)[][];
  totalRow?: (string | number)[];
  notes?: string;
  showSignatures?: boolean;
}

export function openPrintWindow(doc: PrintDocumentData): boolean {
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no,location=no,status=no');
    
    if (!printWindow) {
      return false;
    }

    const metricsHtml = doc.summaryMetrics && doc.summaryMetrics.length > 0
      ? `
        <div class="metrics-grid">
          ${doc.summaryMetrics.map(m => `
            <div class="metric-card" style="${m.color ? `border-top: 3px solid ${m.color};` : ''}">
              <div class="metric-label">${m.label}</div>
              <div class="metric-val" style="${m.color ? `color: ${m.color};` : ''}">${m.value}</div>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const rowsHtml = doc.tableRows.map((row, idx) => `
      <tr class="${idx % 2 === 1 ? 'even-row' : ''}">
        ${row.map((cell, cIdx) => {
          const align = (doc.tableAlignments && doc.tableAlignments[cIdx]) || (cIdx === 0 ? 'center' : cIdx === row.length - 1 ? 'right' : 'left');
          return `<td style="text-align: ${align};">${cell}</td>`;
        }).join('')}
      </tr>
    `).join('');

    const totalRowHtml = doc.totalRow
      ? `
        <tr class="total-row">
          ${doc.totalRow.map((cell, cIdx) => {
            const align = (doc.tableAlignments && doc.tableAlignments[cIdx]) || (cIdx === 0 ? 'left' : cIdx === doc.totalRow!.length - 1 ? 'right' : 'left');
            return `<td style="text-align: ${align};">${cell}</td>`;
          }).join('')}
        </tr>
      `
      : '';

    const signaturesHtml = doc.showSignatures !== false
      ? `
        <div class="signatures">
          <div class="sig-block">
            <div class="sig-line">প্রস্তুতকারী / হিসাবরক্ষক</div>
            <div class="sig-sub">স্বাক্ষর ও তারিখ</div>
          </div>
          <div class="sig-block">
            <div class="sig-line">যাচাইকারী / ম্যানেজার</div>
            <div class="sig-sub">স্বাক্ষর ও তারিখ</div>
          </div>
          <div class="sig-block">
            <div class="sig-line">অনুমোদনকারী (মালিক)</div>
            <div class="sig-sub">তুলতুল ভিলা, ঢাকা</div>
          </div>
        </div>
      `
      : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${doc.propertyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Newsreader:opsz,wght@6..72,700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #141414;
      background: #f8f8f8;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .print-container {
      background: #ffffff;
      max-width: 820px;
      margin: 0 auto;
      padding: 40px;
      border: 1px solid #ddd;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .header {
      text-align: center;
      border-bottom: 2px solid #141414;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 26px;
      color: #141414;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    
    .header .address {
      font-size: 12px;
      color: #555;
      margin-bottom: 3px;
    }
    
    .header .contact {
      font-size: 11px;
      color: #777;
      margin-bottom: 12px;
    }
    
    .report-badge {
      display: inline-block;
      background: #141414;
      color: #ffffff;
      padding: 6px 18px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f4f3f0;
      padding: 10px 14px;
      border: 1px solid #141414;
      margin-bottom: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .metric-card {
      background: #f9f9f8;
      border: 1px solid #141414;
      padding: 12px;
      text-align: center;
    }
    
    .metric-label {
      font-size: 11px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .metric-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #141414;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    
    th {
      background: #ebeae6;
      color: #141414;
      font-weight: 700;
      border: 1px solid #141414;
      padding: 8px 10px;
      font-size: 11px;
      text-transform: uppercase;
    }
    
    td {
      border: 1px solid #ccc;
      padding: 7px 10px;
      font-family: 'JetBrains Mono', 'Hind Siliguri', monospace;
    }
    
    .even-row {
      background: #fafaf9;
    }
    
    .total-row td {
      background: #ebeae6;
      border-top: 2px solid #141414;
      border-bottom: 2px solid #141414;
      font-weight: 700;
      font-size: 13px;
      color: #141414;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    
    .sig-block {
      text-align: center;
      width: 200px;
    }
    
    .sig-line {
      border-top: 1px solid #141414;
      padding-top: 6px;
      font-weight: 700;
      font-size: 12px;
      color: #141414;
    }
    
    .sig-sub {
      font-size: 10px;
      color: #666;
    }

    .print-controls {
      position: fixed;
      top: 12px;
      right: 12px;
      background: #ffffff;
      border: 1px solid #141414;
      padding: 8px 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      gap: 8px;
    }

    .btn {
      background: #141414;
      color: #fff;
      border: none;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      border-radius: 2px;
    }

    .btn-close {
      background: #e0e0e0;
      color: #141414;
    }
    
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .print-controls {
        display: none !important;
      }
      @page {
        size: A4 portrait;
        margin: 15mm 12mm 15mm 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="print-controls no-print">
    <button class="btn" onclick="window.print()">🖨️ প্রিন্ট করুন (Print / Save PDF)</button>
    <button class="btn btn-close" onclick="window.close()">✕ বন্ধ করুন</button>
  </div>

  <div class="print-container">
    <div class="header">
      <h1>${doc.propertyName}</h1>
      <div class="address">${doc.propertyAddress}</div>
      ${doc.propertyPhone || doc.propertyEmail ? `<div class="contact">মোবাইল: ${doc.propertyPhone || ''} ${doc.propertyEmail ? `| ইমেইল: ${doc.propertyEmail}` : ''}</div>` : ''}
      <div class="report-badge">${doc.title}</div>
      ${doc.subtitle ? `<div style="font-size: 12px; color: #555; margin-top: 6px; font-weight: 600;">${doc.subtitle}</div>` : ''}
    </div>

    <div class="meta-bar">
      <div><strong>রিপোর্ট নং:</strong> ${doc.referenceNo}</div>
      <div><strong>তারিখ:</strong> ${doc.reportDate}</div>
      <div><strong>প্রস্তুতকারী:</strong> ${doc.preparedBy}</div>
    </div>

    ${metricsHtml}

    <table>
      <thead>
        <tr>
          ${doc.tableHeaders.map((th, idx) => {
            const align = (doc.tableAlignments && doc.tableAlignments[idx]) || (idx === 0 ? 'center' : idx === doc.tableHeaders.length - 1 ? 'right' : 'left');
            return `<th style="text-align: ${align};">${th}</th>`;
          }).join('')}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        ${totalRowHtml}
      </tbody>
    </table>

    ${doc.notes ? `<div style="font-size: 11px; color: #666; margin-bottom: 20px; font-style: italic;">* ${doc.notes}</div>` : ''}

    ${signaturesHtml}
  </div>

  <script>
    window.addEventListener('load', function() {
      // Auto trigger print after 300ms so fonts load cleanly
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.error(e);
        }
      }, 350);
    });
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Error opening print window:', err);
    return false;
  }
}
