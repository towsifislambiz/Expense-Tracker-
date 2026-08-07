/**
 * Export transactions dataset to CSV file
 */
export const exportToCSV = (transactions = []) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  const headers = ["Title / Merchant", "Amount", "Type", "Category", "Date", "Status", "Note"];
  
  const rows = transactions.map((t) => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount || 0,
    t.type || 'expense',
    t.category || 'others',
    t.date || '',
    t.status || 'completed',
    `"${(t.notes || t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expense-ledger-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export transactions dataset to printable PDF report format
 */
export const exportToPDF = (transactions = []) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    const typeStr = String(t.type || '').toLowerCase().trim();
    if (typeStr === 'income') totalIncome += amt;
    if (typeStr === 'expense') totalExpense += amt;
  });

  const netBalance = totalIncome - totalExpense;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups to generate PDF report.");
    return;
  }

  const tableRowsHtml = transactions
    .map(
      (t) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.date || ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${t.title || 'Untitled'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${t.category || 'general'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: uppercase; color: ${t.type === 'income' ? '#059669' : '#dc2626'}; font-weight: bold;">${t.type || 'expense'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${t.type === 'income' ? '+' : '-'}$${(Number(t.amount) || 0).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Financial Ledger Report - ${todayStr}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; }
          h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          .summary-box { display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .stat { flex: 1; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .stat-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #475569; }
        </style>
      </head>
      <body>
        <h1>Financial Ledger Report</h1>
        <div class="subtitle">Generated on ${todayStr} • Total Transactions: ${transactions.length}</div>
        
        <div class="summary-box">
          <div class="stat">
            <div class="stat-label">Net Balance</div>
            <div class="stat-val" style="color: ${netBalance >= 0 ? '#059669' : '#dc2626'}">$${netBalance.toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Income</div>
            <div class="stat-val" style="color: #059669">$${totalIncome.toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Expense</div>
            <div class="stat-val" style="color: #dc2626">$${totalExpense.toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export const exportFinancialReportPDF = exportToPDF;
export const exportFinancialReportCSV = exportToCSV;
