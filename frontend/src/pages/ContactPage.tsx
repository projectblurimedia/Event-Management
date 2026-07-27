import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/lib/api/settings';
import { useCreateEnquiry } from '@/lib/api/enquiries';
import { siteConfig } from '@/lib/siteConfig';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n/translations';

const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(1, 'Please tell us a little about your event'),
});
type EnquiryForm = z.infer<typeof enquirySchema>;

export function ContactPage() {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const createEnquiry = useCreateEnquiry();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryForm>({ resolver: zodResolver(enquirySchema) });

  const phone = settings?.phone ?? siteConfig.phone;
  const email = settings?.email ?? siteConfig.email;
  const address = settings?.address ?? siteConfig.address;
  const mapEmbedUrl = settings?.mapEmbedUrl ?? siteConfig.mapEmbedUrl;

  const contactCards: { icon: typeof Phone; labelKey: TranslationKey; value: string; href: string }[] = [
    { icon: Phone, labelKey: 'contact.callUs', value: `+91 ${phone}`, href: `tel:+91${phone}` },
    { icon: Mail, labelKey: 'contact.emailUs', value: email, href: `mailto:${email}` },
    { icon: MapPin, labelKey: 'contact.visitUs', value: address, href: mapEmbedUrl },
  ];

  async function onSubmit(values: EnquiryForm) {
    try {
      await createEnquiry.mutateAsync({ ...values, email: values.email || undefined });
      toast.success(t('contact.thanksMessage'));
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, t('contact.enquiryFailed')));
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact | {siteConfig.businessName}</title>
        <meta name="description" content="Get in touch for a free consultation on your wedding, birthday or corporate event." />
      </Helmet>
      <PageHero
        eyebrow={t('page.contact.eyebrow')}
        title={t('page.contact.title')}
        description={t('page.contact.description')}
      />

      <Container className="grid gap-6 py-16 sm:grid-cols-3">
        {contactCards.map(({ icon: Icon, labelKey, value, href }) => (
          <a
            key={labelKey}
            href={href}
            target={labelKey === 'contact.visitUs' ? '_blank' : undefined}
            rel={labelKey === 'contact.visitUs' ? 'noopener noreferrer' : undefined}
            className="border-border bg-surface hover:border-gold flex flex-col items-center gap-3 rounded-2xl border p-8 text-center transition-colors"
          >
            <span className="bg-gold/10 text-gold flex h-12 w-12 items-center justify-center rounded-full">
              <Icon size={20} />
            </span>
            <span className="text-text-muted text-sm font-semibold tracking-[0.2em] uppercase">
              {t(labelKey)}
            </span>
            <span className="text-sm">{value}</span>
          </a>
        ))}
      </Container>

      <Container className="grid gap-10 pb-20 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-8"
        >
          <h2 className="text-lg font-semibold">{t('contact.sendEnquiry')}</h2>
          <div>
            <input
              placeholder={t('contact.yourName')}
              aria-label={t('contact.yourName')}
              className="border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
              {...register('name')}
            />
            {errors.name && <p className="text-rose mt-1 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <input
              placeholder={t('contact.phoneNumber')}
              aria-label={t('contact.phoneNumber')}
              className="border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
              {...register('phone')}
            />
            {errors.phone && <p className="text-rose mt-1 text-sm">{errors.phone.message}</p>}
          </div>
          <div>
            <input
              placeholder={t('contact.emailOptional')}
              aria-label={t('contact.emailOptional')}
              className="border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
              {...register('email')}
            />
            {errors.email && <p className="text-rose mt-1 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <textarea
              placeholder={t('contact.tellUsAboutEvent')}
              aria-label={t('contact.tellUsAboutEvent')}
              rows={4}
              className="border-border bg-bg focus:border-gold w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none"
              {...register('message')}
            />
            {errors.message && <p className="text-rose mt-1 text-sm">{errors.message.message}</p>}
          </div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? t('contact.sending') : t('contact.sendEnquiry')}
          </Button>
        </form>

        <div className="border-gold/30 aspect-video w-full overflow-hidden rounded-2xl border lg:aspect-auto">
          <iframe
            title="Business location"
            src={mapEmbedUrl}
            className="h-full min-h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </>
  );
}
