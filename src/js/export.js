// ============================================================================
// DATA EXPORT MODULE
// ============================================================================

import { logger } from './utils.js';

/**
 * Export expenses to CSV
 */
export function exportExpensesToCSV(expenses, filename = 'expenses.csv') {
    try {
        const headers = ['Date', 'Category', 'Name', 'Amount', 'Currency'];
        const rows = expenses.map(expense => {
            const data = expense.data ? expense.data() : expense;
            return [
                data.date || '',
                data.category || '',
                data.name || '',
                data.amount || 0,
                data.currency || 'AZN'
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        downloadFile(csvContent, filename, 'text/csv');
        logger.info('Expenses exported to CSV');
    } catch (e) {
        logger.error('Error exporting expenses:', e);
        throw e;
    }
}

/**
 * Export debts to CSV
 */
export function exportDebtsToCSV(debts, filename = 'debts.csv') {
    try {
        const headers = ['Name', 'Total Amount', 'Paid Amount', 'Remaining', 'Last Payment Date', 'Comments'];
        const rows = debts.map(debt => {
            const data = debt.data ? debt.data() : debt;
            const remaining = (data.totalAmount || 0) - (data.paidAmount || 0);
            return [
                data.name || '',
                data.totalAmount || 0,
                data.paidAmount || 0,
                remaining,
                data.lastPaymentDate || '',
                (data.comments || '').replace(/"/g, '""')
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        downloadFile(csvContent, filename, 'text/csv');
        logger.info('Debts exported to CSV');
    } catch (e) {
        logger.error('Error exporting debts:', e);
        throw e;
    }
}

/**
 * Export to PDF (requires jsPDF library)
 */
export async function exportToPDF(title, data, filename = 'report.pdf') {
    try {
        if (typeof window.jspdf === 'undefined') {
            // Load jsPDF dynamically
            await loadScriptSafely('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not available');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(title, 14, 22);

        let y = 30;
        doc.setFontSize(12);
        
        data.forEach((row, index) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(row, 14, y);
            y += 7;
        });

        doc.save(filename);
        logger.info('PDF exported');
    } catch (e) {
        logger.error('Error exporting PDF:', e);
        throw e;
    }
}

/**
 * Download file helper
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Load script helper
 */
function loadScriptSafely(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
