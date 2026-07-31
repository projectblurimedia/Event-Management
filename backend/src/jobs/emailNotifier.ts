import { env } from '../config/env';
import { sendMail } from '../config/mailer';
import { getSettings } from '../modules/settings/settings.service';

interface BookingLike {
  bookingCode: string;
  customerName: string;
  phone: string;
  email: string | null;
  eventType: string;
  eventDate: Date;
  guestCount: number;
}

export async function sendBookingNotificationEmail(booking: BookingLike) {
  if (!env.ADMIN_NOTIFICATION_EMAIL) {
    console.info(
      `[emailNotifier] ADMIN_NOTIFICATION_EMAIL not configured — skipping admin notification for booking ${booking.bookingCode}`,
    );
    return;
  }

  const settings = await getSettings();

  await sendMail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New Booking Received — ${booking.bookingCode}`,
    fromName: settings?.businessName,
    html: `
      <h2>New booking received</h2>
      <p><strong>Booking ID:</strong> ${booking.bookingCode}</p>
      <p><strong>Customer:</strong> ${booking.customerName} (${booking.phone}${booking.email ? `, ${booking.email}` : ''})</p>
      <p><strong>Event:</strong> ${booking.eventType} on ${new Date(booking.eventDate).toLocaleDateString()}</p>
      <p><strong>Guests:</strong> ${booking.guestCount}</p>
    `,
  });
}
