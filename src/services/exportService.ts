import { Project, MDSRevision, ComplianceResult, DeviationItem, ClarificationItem, TBEScore } from '../types';

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printEngineeringReport(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 30px;
            color: #1e293b;
            font-size: 12px;
          }
          h1, h2, h3 { color: #0f172a; margin-bottom: 6px; }
          .header-box {
            border: 2px solid #0f172a;
            padding: 12px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 2fr 1fr;
          }
          .meta-item { margin: 3px 0; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 25px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 600;
            font-size: 10px;
          }
          .badge-compliant { background: #dcfce7; color: #15803d; }
          .badge-deviating { background: #fee2e2; color: #b91c1c; }
          .badge-unclear { background: #fef3c7; color: #b45309; }
          .badge-missing { background: #f1f5f9; color: #475569; }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            font-size: 10px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { margin: 10mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function generateMDSPrintHtml(project: Project, mdsRevision: MDSRevision): string {
  const rows = mdsRevision.fields
    .map(
      (f) => `
    <tr>
      <td><strong>${f.parameterName}</strong></td>
      <td>${f.category.toUpperCase()}</td>
      <td>${f.originalValue ?? '—'}</td>
      <td>${f.originalUnit ?? '—'}</td>
      <td>${f.normalizedValue ? `${f.normalizedValue} ${f.normalizedUnit || ''}` : '—'}</td>
      <td>${f.source ? `${f.source.documentName} (p.${f.source.page})` : 'Missing'}</td>
      <td>${f.status}</td>
    </tr>
  `
    )
    .join('');

  return `
    <div class="header-box">
      <div>
        <h2>MECHANICAL DATA SHEET (MDS)</h2>
        <div class="meta-item"><strong>Project:</strong> ${project.name} (${project.projectNumber})</div>
        <div class="meta-item"><strong>Equipment Tag:</strong> ${project.equipmentTag} - ${project.equipmentName}</div>
        <div class="meta-item"><strong>Client / Facility:</strong> ${project.client} / ${project.facility}</div>
      </div>
      <div>
        <div class="meta-item"><strong>Document No:</strong> MDS-${project.equipmentTag}-001</div>
        <div class="meta-item"><strong>Revision:</strong> ${mdsRevision.revision}</div>
        <div class="meta-item"><strong>Date:</strong> ${new Date(mdsRevision.createdAt).toLocaleDateString()}</div>
        <div class="meta-item"><strong>Status:</strong> ${mdsRevision.status}</div>
        <div class="meta-item"><strong>Approved By:</strong> ${mdsRevision.approvedBy || 'Pending'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Category</th>
          <th>Specified Value</th>
          <th>Unit</th>
          <th>Normalized Unit (ISO/SI)</th>
          <th>Source Document</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="footer">
      <div>CONFIDENTIAL & PROPRIETARY — EPC ENGINEERING DIVISION</div>
      <div>Generated via AeroMDS Engineering Platform (Decision Support Only)</div>
    </div>
  `;
}
