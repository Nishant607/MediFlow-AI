/**
 * Universal Report Generation & Export Utility for MediFlow AI
 * Supports:
 *  1. UTF-8 CSV Export (Excel compatible with Rupee ₹ sign support)
 *  2. Excel XML Spreadsheet (.xls)
 *  3. Printable Hospital Medical Report (Browser Print-to-PDF with Hospital Branding)
 */

/**
 * Download data as an Excel-compatible CSV file with UTF-8 BOM
 * @param {string} filename - Base name of the file (without extension)
 * @param {string[]} headers - Array of header titles
 * @param {Array<Array<string|number>>} rows - 2D array of row values
 */
export const exportToCSV = (filename, headers, rows) => {
  const sanitizeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerRow = headers.map(sanitizeCell).join(',');
  const dataRows = rows.map((row) => row.map(sanitizeCell).join(',')).join('\r\n');
  const csvContent = '\uFEFF' + headerRow + '\r\n' + dataRows;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download data as an Excel XML Spreadsheet (.xls) with formatted headers and grid lines
 * @param {string} filename - Base name of the file (without extension)
 * @param {string} sheetName - Worksheet title
 * @param {string[]} headers - Array of header titles
 * @param {Array<Array<string|number>>} rows - 2D array of row values
 */
export const exportToExcel = (filename, sheetName, headers, rows) => {
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#0EA5C9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0B8BAA"/>
   </Borders>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Data">
   <Font ss:Size="10" ss:Color="#1E293B"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Zebra">
   <Font ss:Size="10" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName || 'Report'}">
  <Table>
   <Row ss:Height="24">
`;

  headers.forEach((h) => {
    xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  rows.forEach((row, idx) => {
    const styleId = idx % 2 === 0 ? 'Data' : 'Zebra';
    xml += `   <Row ss:Height="18">\n`;
    row.forEach((val) => {
      const isNum = typeof val === 'number';
      const cellVal = val === null || val === undefined ? '' : String(val);
      xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${cellVal
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Triggers a hospital-branded, printable PDF layout with executive header,
 * summary cards, styled data tables, and authorized sign-off footer.
 *
 * @param {Object} options
 * @param {string} options.title - Document title (e.g. "Staff Roster Audit Report")
 * @param {string} options.subtitle - Document subtitle (e.g. "Active medical staff & departmental allocation")
 * @param {Array<{label: string, value: string|number}>} [options.summaryCards] - Top KPI summary chips
 * @param {string[]} options.columns - Table header titles
 * @param {Array<Array<string|number>>} options.data - 2D array of table row data
 * @param {string} [options.facilityName] - Optional facility name (defaults to "MediFlow AI Healthcare Network")
 */
export const printMedicalReport = ({
  title,
  subtitle,
  summaryCards = [],
  columns = [],
  data = [],
  facilityName = 'MediFlow AI Healthcare Center',
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const printWindow = window.open('', '_blank', 'width=1050,height=850');
  if (!printWindow) {
    alert('Please allow popups to generate and print this medical report.');
    return;
  }

  const summaryHtml =
    summaryCards.length > 0
      ? `
      <div class="summary-grid">
        ${summaryCards
          .map(
            (c) => `
          <div class="summary-card">
            <div class="summary-value">${c.value}</div>
            <div class="summary-label">${c.label}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `
      : '';

  const tableHeaderHtml = columns.map((col) => `<th>${col}</th>`).join('');
  const tableRowsHtml = data
    .map(
      (row, idx) => `
    <tr class="${idx % 2 === 0 ? 'even-row' : 'odd-row'}">
      ${row.map((cell) => `<td>${cell === null || cell === undefined ? '—' : cell}</td>`).join('')}
    </tr>
  `
    )
    .join('');

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} — ${facilityName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.5;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0EA5C9;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #0B8BAA;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-cross {
      display: inline-block;
      width: 14px;
      height: 14px;
      background: #00843D;
      color: #ffffff;
      border-radius: 3px;
      text-align: center;
      line-height: 14px;
      font-weight: 900;
      font-size: 11px;
    }
    .brand-subtitle {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      text-align: right;
      font-size: 10px;
      color: #475569;
    }
    .doc-meta strong {
      color: #0f172a;
    }
    .report-title-section {
      margin-bottom: 16px;
    }
    .report-title {
      font-size: 16px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 4px 0;
    }
    .report-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 18px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      border-left: 3px solid #0EA5C9;
    }
    .summary-value {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .summary-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 8px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      font-size: 9.5px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      border: 1px solid #0f172a;
    }
    td {
      padding: 6px 9px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    tr.odd-row td {
      background: #f8fafc;
    }
    .footer-section {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9px;
      color: #64748b;
    }
    .signature-box {
      text-align: right;
    }
    .signature-line {
      width: 180px;
      border-top: 1px solid #475569;
      margin-bottom: 4px;
    }
    .badge-paid {
      background: #dcfce7;
      color: #166534;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5px;
    }
    .badge-pending {
      background: #fef3c7;
      color: #92400e;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="brand-title">
        <span class="brand-cross">+</span> ${facilityName}
      </div>
      <div class="brand-subtitle">Clinical Information &amp; Hospital Management Suite</div>
    </div>
    <div class="doc-meta">
      <div>Report Timestamp: <strong>${currentDate}</strong></div>
      <div>Classification: <strong style="color: #0EA5C9;">Official Hospital Record</strong></div>
      <div>Audit Status: <strong>Verified System Extract</strong></div>
    </div>
  </div>

  <div class="report-title-section">
    <h1 class="report-title">${title}</h1>
    <p class="report-subtitle">${subtitle}</p>
  </div>

  ${summaryHtml}

  <table>
    <thead>
      <tr>${tableHeaderHtml}</tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="footer-section">
    <div>
      <div>This is an official computer-generated document from MediFlow AI Clinical Suite.</div>
      <div>Confidential medical &amp; administrative record. For authorized personnel only.</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>Authorized Medical Administrator</div>
      <div>MediFlow AI Health Authority</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
};
