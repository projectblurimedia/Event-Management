/** Normalises a customer-entered phone number into a wa.me-compatible digit string. */
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function callHref(phone: string) {
  return `tel:+${normalizePhone(phone)}`;
}

export function whatsappHref(phone: string, message?: string) {
  const base = `https://wa.me/${normalizePhone(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
