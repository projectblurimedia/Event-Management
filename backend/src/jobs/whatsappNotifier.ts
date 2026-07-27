/**
 * Placeholder for a future WhatsApp Business API integration (e.g. Twilio,
 * Meta Cloud API, or Gupshup). Wire a real provider behind this interface
 * without touching call sites (bookings.service.ts) — same shape as
 * emailNotifier.sendBookingNotificationEmail.
 */
interface BookingNotification {
  bookingCode: string;
  phone: string;
}

export async function sendBookingWhatsAppMessage(_booking: BookingNotification): Promise<void> {
  return Promise.resolve();
}
