import toast from 'react-hot-toast';
import { Mail, MessageCircle, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { useAdminEnquiries, useMarkEnquiryRead, useDeleteEnquiry } from '@/lib/api/enquiries';
import { callHref, whatsappHref } from '@/lib/contactActions';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';

export function AdminEnquiriesPage() {
  const { t } = useTranslation();
  const { data: enquiries, isLoading, isError, refetch } = useAdminEnquiries();
  const markRead = useMarkEnquiryRead();
  const deleteEnquiry = useDeleteEnquiry();

  const unreadCount = enquiries?.filter((e) => !e.isRead).length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('admin.enquiries.title')}</h1>
          <p className="text-text-muted mt-1 text-base">{t('admin.enquiries.subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-gold/10 text-gold rounded-full px-3.5 py-1.5 text-sm font-semibold">
            {unreadCount} {t('admin.enquiries.unread')}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-text-muted text-base">{t('common.loading')}</p>}
        {isError && (
          <div className="border-border bg-surface rounded-2xl border p-6 text-center">
            <p className="text-rose text-base">{t('admin.enquiries.couldNotLoad')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="border-gold text-gold mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-ink-black"
            >
              <RefreshCw size={14} /> {t('common.tryAgain')}
            </button>
          </div>
        )}
        {!isLoading && !isError && enquiries?.length === 0 && (
          <div className="border-border bg-surface text-text-muted rounded-2xl border border-dashed p-10 text-center text-base">
            {t('admin.enquiries.noEnquiries')}
          </div>
        )}
        {enquiries?.map((enq) => (
          <div
            key={enq.id}
            className={cn(
              'border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-start sm:justify-between',
              !enq.isRead && 'border-gold ring-gold/30 ring-1',
            )}
          >
            <div className="flex gap-3">
              <span className="bg-gold/10 text-gold font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold">
                {enq.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{enq.name}</p>
                  {!enq.isRead && <span className="bg-gold h-1.5 w-1.5 rounded-full" aria-label="Unread" />}
                </div>
                <p className="text-text-muted text-sm">
                  {enq.phone}
                  {enq.email && ` · ${enq.email}`} · {new Date(enq.createdAt).toLocaleString('en-IN')}
                </p>
                <p className="text-text mt-2 text-base">{enq.message}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
              <div className="flex gap-2">
                <a
                  href={callHref(enq.phone)}
                  aria-label={`Call ${enq.name}`}
                  className="border-gold text-gold flex h-9 w-9 items-center justify-center rounded-full border hover:bg-gold hover:text-ink-black"
                >
                  <Phone size={15} />
                </a>
                <a
                  href={whatsappHref(enq.phone, `Hi ${enq.name}, thanks for reaching out to ${siteConfig.businessName}! `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${enq.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white hover:brightness-95"
                >
                  <MessageCircle size={15} />
                </a>
                {enq.email && (
                  <a
                    href={`mailto:${enq.email}`}
                    aria-label={`Email ${enq.name}`}
                    className="border-border text-text-muted flex h-9 w-9 items-center justify-center rounded-full border hover:border-gold hover:text-gold"
                  >
                    <Mail size={15} />
                  </a>
                )}
              </div>
              <div className="flex gap-3">
                {!enq.isRead && (
                  <button
                    type="button"
                    onClick={() =>
                      markRead.mutate(enq.id, {
                        onError: (error) => toast.error(getErrorMessage(error, t('admin.enquiries.markReadFailed'))),
                      })
                    }
                    className="text-gold text-sm font-semibold"
                  >
                    {t('admin.enquiries.markRead')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    window.confirm(t('admin.enquiries.deleteConfirm')) &&
                    deleteEnquiry.mutate(enq.id, {
                      onError: (error) => toast.error(getErrorMessage(error, t('admin.enquiries.deleteFailed'))),
                    })
                  }
                  aria-label="Delete enquiry"
                  className="text-rose flex items-center gap-1 text-sm font-semibold"
                >
                  <Trash2 size={13} /> {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
