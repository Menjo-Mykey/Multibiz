// CSV Export utility

interface ExportData {
  [key: string]: any;
}

export const exportToCSV = (data: ExportData[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsToCSV = (transactions: any[]) => {
  const exportData = transactions.map(t => ({
    Date: new Date(t.created_at).toLocaleDateString(),
    Time: new Date(t.created_at).toLocaleTimeString(),
    Business: t.business_type === 'triplek' ? 'TrippleK Barbershop' : 'Swan Water',
    'Total Amount': `KSh ${t.total_amount}`,
    'Payment Method': t.payment_method,
    Status: t.status,
    Customer: t.customer_phone || 'Walk-in',
    Staff: t.staff_name || 'N/A',
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(exportData, `transactions-${timestamp}`);
};

export const exportSalesReportToCSV = (salesData: any[]) => {
  const exportData = salesData.map(s => ({
    Date: s.date,
    'TrippleK Revenue': `KSh ${s.triplek}`,
    'Swan Revenue': `KSh ${s.swan}`,
    'Total Revenue': `KSh ${s.total}`,
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(exportData, `sales-report-${timestamp}`);
};

export const exportInventoryToCSV = (products: any[]) => {
  const exportData = products.map(p => ({
    Name: p.name,
    SKU: p.sku || p.size,
    Price: `KSh ${p.price}`,
    Stock: p.stock_quantity || p.stock,
    'Low Stock Threshold': p.low_stock_threshold || p.lowStockThreshold,
    Status: p.is_active ? 'Active' : 'Inactive',
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(exportData, `inventory-${timestamp}`);
};
