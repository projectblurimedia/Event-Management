import { env } from './env';

export const isSmsConfigured = Boolean(env.FAST2SMS_API_KEY);

// Normalizes to the bare 10-digit Indian mobile number Fast2SMS expects (no country code).
function normalizeIndianNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

export async function sendSms(phone: string, message: string) {
  if (!env.FAST2SMS_API_KEY) {
    console.info(`[sms] FAST2SMS_API_KEY not configured — skipping SMS to ${phone}: ${message}`);
    return;
  }

  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('authorization', env.FAST2SMS_API_KEY);
  url.searchParams.set('route', 'q');
  url.searchParams.set('language', 'english');
  url.searchParams.set('message', message);
  url.searchParams.set('numbers', normalizeIndianNumber(phone));

  const res = await fetch(url, { method: 'GET' });
  const data = (await res.json()) as { return?: boolean; message?: string[] };

  if (!res.ok || data.return !== true) {
    console.error('[sms] Fast2SMS send failed:', data);
    throw new Error('Failed to send SMS. Please try again.');
  }
}
