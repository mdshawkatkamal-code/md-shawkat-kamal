import { AppSettings, TenantReminder } from '../types';
import { formatDateBn, MONTHS_BN, toBengaliNumber } from './formatters';

export function compileReminderMessage(
  template: string,
  tenant: {
    tenantName: string;
    unitNumber: string;
    totalDue: number;
    dueDate: string;
    daysUntilDue: number;
    month: string;
    year: number;
  },
  settings: AppSettings
): string {
  const daysText =
    tenant.daysUntilDue === 0
      ? 'আজই শেষ দিন'
      : tenant.daysUntilDue > 0
      ? `${toBengaliNumber(tenant.daysUntilDue)} দিন বাকি`
      : `${toBengaliNumber(Math.abs(tenant.daysUntilDue))} দিন অতিবাহিত (বকেয়া)`;

  const formattedDueDate = formatDateBn(tenant.dueDate) || tenant.dueDate;
  const monthBn = MONTHS_BN[tenant.month] || tenant.month;
  const phone = settings.phone?.split(',')[0]?.trim() || settings.phone || '01711234567';

  return template
    .replaceAll('{TENANT_NAME}', tenant.tenantName)
    .replaceAll('{UNIT_NUMBER}', tenant.unitNumber)
    .replaceAll('{MONTH}', `${monthBn} ${toBengaliNumber(tenant.year)}`)
    .replaceAll('{DUE_DATE}', formattedDueDate)
    .replaceAll('{DUE_AMOUNT}', toBengaliNumber(tenant.totalDue))
    .replaceAll('{DAYS_LEFT}', daysText)
    .replaceAll('{PROPERTY_NAME}', settings.propertyNameBn || settings.propertyName || 'তুলতুল ভিলা')
    .replaceAll('{PAYMENT_PHONE}', phone);
}
