import { Phone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useSettings } from '@/lib/api/settings';
import { useTranslation } from '@/hooks/useTranslation';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.996.586 3.87 1.6 5.44L2 22l4.686-1.566a9.96 9.96 0 0 0 5.318 1.53h.004c5.518 0 10.004-4.486 10.004-10.004S17.522 2 12.004 2zm0 18.19h-.003a8.14 8.14 0 0 1-4.15-1.135l-.298-.177-3.104 1.038 1.052-3.03-.194-.31a8.152 8.152 0 0 1-1.243-4.372c0-4.508 3.67-8.178 8.18-8.178a8.14 8.14 0 0 1 8.176 8.184c0 4.508-3.67 8.178-8.176 8.178z" />
    </svg>
  );
}

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const phone = settings?.phone ?? '';
  const whatsapp = settings?.whatsapp ?? '';

  return (
    <Modal open={open} onClose={onClose} title={t('contactModal.title')}>
      <p className="text-text-muted -mt-2 mb-5 text-sm">{t('contactModal.description')}</p>
      <div className="flex flex-col gap-3">
        <a
          href={`tel:+91${phone}`}
          className="border-gold text-gold flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold hover:bg-gold hover:text-ink-black"
        >
          <Phone size={18} /> {t('contactModal.callNow')}
        </a>
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
        >
          <WhatsAppIcon /> {t('contactModal.whatsappUs')}
        </a>
      </div>
    </Modal>
  );
}
