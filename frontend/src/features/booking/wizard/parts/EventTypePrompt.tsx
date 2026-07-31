import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AsyncState } from '@/components/ui/AsyncState';
import { eventTypeHooks } from '@/lib/api/resources';
import { useBookingCartStore } from '@/store/bookingCartStore';
import { useTranslation } from '@/hooks/useTranslation';

export function EventTypePrompt() {
  const { t, tf } = useTranslation();
  const { data: eventTypes, isLoading, isError, refetch } = eventTypeHooks.usePublicList();
  const setCustomerField = useBookingCartStore((s) => s.setCustomerField);
  const [value, setValue] = useState('');

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-10 text-center">
      <span className="bg-gold/10 text-gold flex h-14 w-14 items-center justify-center rounded-full">
        <PartyPopper size={24} />
      </span>
      <div>
        <h3 className="text-lg font-semibold">{t('wizard.whichEvent')}</h3>
        <p className="text-text-muted mt-1 text-sm">{t('wizard.eventHelperText')}</p>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingLabel={t('common.loading')}
        errorLabel="Couldn't load event types. Please check your connection and try again."
        minHeight="min-h-[10vh]"
        compact
      >
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={t('wizard.whichEvent')}
          className="border-border bg-bg focus:border-gold w-64 rounded-lg border px-3.5 py-2.5 text-center text-base font-medium outline-none"
        >
          <option value="">{t('admin.selectPlaceholder')}</option>
          {eventTypes?.map((et) => (
            <option key={et.id} value={et.id}>
              {tf(et.name, et.nameTe)}
            </option>
          ))}
        </select>
      </AsyncState>

      <Button variant="primary" onClick={() => setCustomerField('eventTypeId', value)} disabled={!value}>
        {t('wizard.continue')}
      </Button>
    </div>
  );
}
