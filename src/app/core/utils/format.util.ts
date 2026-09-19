export function formatCurrency(amount: number, lang: string, currency: string = 'EGP'): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDateTime(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Local YYYY-MM-DD, not toISOString() - avoids the UTC-truncation day-shift
// on matDatepicker values.
export function toLocalDateString(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return undefined;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
