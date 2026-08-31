export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const MONTHS_BN: Record<string, string> = {
  January: 'জানুয়ারি',
  February: 'ফেব্রুয়ারি',
  March: 'মার্চ',
  April: 'এপ্রিল',
  May: 'মে',
  June: 'জুন',
  July: 'জুলাই',
  August: 'আগস্ট',
  September: 'সেপ্টেম্বর',
  October: 'অক্টোবর',
  November: 'নভেম্বর',
  December: 'ডিসেম্বর',
};

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  const str = String(num);
  return str.replace(/[0-9]/g, (w) => BENGALI_DIGITS[+w]);
}

export function formatCurrency(
  amount: number,
  options?: { showSymbol?: boolean; useBengaliDigits?: boolean }
): string {
  const { showSymbol = true, useBengaliDigits = false } = options || {};
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount || 0);

  const display = useBengaliDigits ? toBengaliNumber(formatted) : formatted;
  return showSymbol ? `৳${display}` : display;
}

export function formatMonthYear(month: string, year: number, lang: 'bn' | 'en' = 'bn'): string {
  if (lang === 'bn') {
    const monthBn = MONTHS_BN[month] || month;
    return `${monthBn} ${toBengaliNumber(year)}`;
  }
  return `${month} ${year}`;
}

export function getCurrentMonthYear(): { month: string; year: number; dateStr: string } {
  // Use August 2026 as per local context or current real date
  const now = new Date();
  // We align with 2026
  const monthName = MONTHS[now.getMonth()] || 'August';
  const year = 2026;
  const dateStr = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  return { month: monthName, year, dateStr };
}

export function formatDateBn(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = toBengaliNumber(date.getDate());
  const month = MONTHS_BN[MONTHS[date.getMonth()]] || MONTHS[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  return `${day} ${month} ${year}`;
}
