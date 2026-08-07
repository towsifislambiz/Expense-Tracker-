/**
 * Export transactions to CSV file
 */
export const exportToCSV = (transactions, filename = 'luxe_expense_transactions.csv') => {
  if (!transactions || transactions.length === 0) return;

  const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'Status', 'Notes', 'IsRecurring'];
  const rows = transactions.map(t => [
    t.id,
    `"${t.title.replace(/"/g, '""')}"`,
    t.amount,
    t.type,
    t.category,
    t.date,
    t.status,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.isRecurring ? 'Yes' : 'No'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Backup full app state as JSON
 */
export const exportBackupJSON = (data, filename = 'luxe_expense_backup.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
