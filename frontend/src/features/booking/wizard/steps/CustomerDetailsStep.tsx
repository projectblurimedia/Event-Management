import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { useBookingCartStore, type CustomerInfo } from '@/store/bookingCartStore';
import { useCreateBooking } from '@/lib/api/bookings';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';

const detailsSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  altPhone: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  specialRequirements: z.string().optional(),
});
type DetailsForm = z.infer<typeof detailsSchema>;

const inputClass =
  'border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none';
const labelClass = 'text-text-muted mb-1.5 block text-sm font-medium';

export function CustomerDetailsStep() {
  const { t } = useTranslation();
  const customer = useBookingCartStore((s) => s.customer);
  const setCustomerField = useBookingCartStore((s) => s.setCustomerField);
  const guestCount = useBookingCartStore((s) => s.guestCount) ?? 1;
  const setGuestCount = useBookingCartStore((s) => s.setGuestCount);
  const packageId = useBookingCartStore((s) => s.packageId);
  const dietaryPreference = useBookingCartStore((s) => s.dietaryPreference);
  const selectedItems = useBookingCartStore((s) => s.selectedItems);
  const goToStep = useBookingCartStore((s) => s.goToStep);
  const recordSubmittedBooking = useBookingCartStore((s) => s.recordSubmittedBooking);
  const createBooking = useCreateBooking();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DetailsForm>({ resolver: zodResolver(detailsSchema), defaultValues: customer });

  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name) setCustomerField(name as keyof CustomerInfo, (value[name] ?? '') as string);
    });
    return () => sub.unsubscribe();
  }, [watch, setCustomerField]);

  async function onSubmit(values: DetailsForm) {
    try {
      const booking = await createBooking.mutateAsync({
        ...values,
        altPhone: values.altPhone || undefined,
        email: values.email || undefined,
        specialRequirements: values.specialRequirements || undefined,
        eventTypeId: customer.eventTypeId,
        guestCount,
        packageId: packageId ?? undefined,
        dietaryPreference: dietaryPreference ?? undefined,
        items: selectedItems.map((i) => ({ itemId: i.itemId })),
      });
      recordSubmittedBooking({ id: booking.id, bookingCode: booking.bookingCode, phone: booking.phone });
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.bookingFailed')));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">Your Details</h2>
        <p className="text-text-muted mt-1 text-sm">Almost done — tell us how to reach you and confirm the event.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className={labelClass}>Full Name</label>
            <input id="customerName" placeholder="e.g. Priya Sharma" className={inputClass} {...register('customerName')} />
            {errors.customerName && <p className="text-rose mt-1 text-sm">{errors.customerName.message}</p>}
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Mobile Number</label>
            <input id="phone" placeholder="10-digit mobile number" className={inputClass} {...register('phone')} />
            {errors.phone && <p className="text-rose mt-1 text-sm">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="altPhone" className={labelClass}>Alternate Mobile (optional)</label>
            <input id="altPhone" placeholder="Second contact number" className={inputClass} {...register('altPhone')} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email (optional)</label>
            <input id="email" placeholder="you@example.com" className={inputClass} {...register('email')} />
            {errors.email && <p className="text-rose mt-1 text-sm">{errors.email.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelClass}>Event Address</label>
            <input
              id="address"
              placeholder="House/Flat No., Street, Area, City"
              className={inputClass}
              {...register('address')}
            />
            {errors.address && <p className="text-rose mt-1 text-sm">{errors.address.message}</p>}
          </div>
          <div>
            <label htmlFor="eventDate" className={labelClass}>Event Date</label>
            <input id="eventDate" type="date" className={inputClass} {...register('eventDate')} />
            {errors.eventDate && <p className="text-rose mt-1 text-sm">{errors.eventDate.message}</p>}
          </div>
          <div>
            <label htmlFor="eventTime" className={labelClass}>Event Time</label>
            <input id="eventTime" type="time" className={inputClass} {...register('eventTime')} />
            {errors.eventTime && <p className="text-rose mt-1 text-sm">{errors.eventTime.message}</p>}
          </div>
          <div>
            <label htmlFor="guestCount" className={labelClass}>Number of Guests</label>
            <input
              id="guestCount"
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="specialRequirements" className={labelClass}>Special Instructions (optional)</label>
          <textarea
            id="specialRequirements"
            rows={3}
            placeholder="Any specific requests — allergies, seating arrangements, theme preferences, etc."
            className={inputClass}
            {...register('specialRequirements')}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => goToStep('REVIEW')}>
            {t('common.back')}
          </Button>
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting || createBooking.isPending}>
            {isSubmitting || createBooking.isPending ? t('wizard.submitting') : t('wizard.submitBooking')}
          </Button>
        </div>
      </form>
    </div>
  );
}
