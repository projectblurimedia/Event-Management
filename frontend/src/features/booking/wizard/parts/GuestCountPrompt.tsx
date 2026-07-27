import { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { useTranslation } from '@/hooks/useTranslation';

export function GuestCountPrompt() {
  const setGuestCount = useBookingCartStore((s) => s.setGuestCount);
  const [value, setValue] = useState(100);
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-10 text-center">
      <span className="bg-gold/10 text-gold flex h-14 w-14 items-center justify-center rounded-full">
        <Users size={24} />
      </span>
      <div>
        <h3 className="text-lg font-semibold">{t('wizard.howManyGuests')}</h3>
        <p className="text-text-muted mt-1 text-sm">{t('wizard.guestsHelperText')}</p>
      </div>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={t('wizard.guestCount')}
        className="border-border bg-bg focus:border-gold w-32 rounded-lg border px-3.5 py-2.5 text-center text-lg font-semibold outline-none"
      />
      <Button variant="primary" onClick={() => setGuestCount(value)} disabled={value < 1}>
        {t('wizard.continue')}
      </Button>
    </div>
  );
}
