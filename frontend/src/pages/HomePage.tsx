import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Award, Clock, HeartHandshake, Mail, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { LinkButton, Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { ContactModal } from '@/features/booking/ContactModal';
import { useSettings } from '@/lib/api/settings';
import {
  packageHooks,
  galleryHooks,
  testimonialHooks,
  serviceCategoryHooks,
  serviceOptionHooks,
  faqHooks,
} from '@/lib/api/resources';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/cn';

const whyChooseUs: { icon: typeof Award; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Award, titleKey: 'home.why.quality.title', descKey: 'home.why.quality.desc' },
  { icon: Clock, titleKey: 'home.why.onTime.title', descKey: 'home.why.onTime.desc' },
  { icon: HeartHandshake, titleKey: 'home.why.attention.title', descKey: 'home.why.attention.desc' },
  { icon: ShieldCheck, titleKey: 'home.why.trusted.title', descKey: 'home.why.trusted.desc' },
];

export function HomePage() {
  const { t, tf } = useTranslation();
  const { data: settings } = useSettings();
  const { data: packages } = packageHooks.usePublicList();
  const { data: gallery } = galleryHooks.usePublicList();
  const { data: testimonials } = testimonialHooks.usePublicList();
  const { data: serviceCategories } = serviceCategoryHooks.usePublicList();
  const { data: serviceOptions } = serviceOptionHooks.usePublicList();
  const { data: faqs } = faqHooks.usePublicList();
  const [contactOpen, setContactOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState<string | null>(null);
  const activeServiceCategory =
    serviceCategories?.find((c) => c.id === activeServiceTab) ?? serviceCategories?.[0];
  const activeServiceOptions = serviceOptions?.filter((o) => o.categoryId === activeServiceCategory?.id) ?? [];

  const heroHeadline = settings
    ? tf(settings.heroHeadline, settings.heroHeadlineTe)
    : 'Crafting Unforgettable Weddings & Celebrations';
  const heroSubheadline = settings
    ? tf(settings.heroSubheadline, settings.heroSubheadlineTe)
    : 'Full-service wedding planning, catering, decoration and event management — from an intimate housewarming to a grand wedding reception.';
  const introTitle = settings
    ? tf(settings.businessIntroTitle, settings.businessIntroTitleTe)
    : 'A Premium Event Partner for Every Occasion';
  const introText = settings
    ? tf(settings.businessIntroText, settings.businessIntroTextTe)
    : `${siteConfig.businessName} brings together catering, decoration, photography and entertainment under one roof.`;

  const phone = settings?.phone ?? siteConfig.phone;
  const email = settings?.email ?? siteConfig.email;
  const address = settings?.address ?? siteConfig.address;
  const mapEmbedUrl = settings?.mapEmbedUrl ?? siteConfig.mapEmbedUrl;

  return (
    <>
      <Helmet>
        <title>{siteConfig.businessName} | Premium Event Management &amp; Catering</title>
        <meta
          name="description"
          content="Premium wedding planning, catering and event management for weddings, birthdays, housewarmings, engagements and corporate events."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EventPlanner',
            name: settings?.businessName ?? siteConfig.businessName,
            telephone: `+91${phone}`,
            email,
            address,
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="bg-[image:var(--gradient-luxury)] text-cream relative overflow-hidden">
        <div
          aria-hidden
          className="border-gold/30 pointer-events-none absolute inset-4 rounded-2xl border sm:inset-8"
        />
        <Container className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 py-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gold text-sm font-semibold tracking-[0.35em] uppercase"
          >
            {settings?.organiser ?? siteConfig.organiser} Presents
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-4xl font-semibold text-balance sm:text-6xl"
          >
            {heroHeadline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-cream/70 max-w-xl text-balance"
          >
            {heroSubheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <LinkButton to="/booking" variant="primary" size="lg">
              {t('nav.bookNow')}
            </LinkButton>
            <Button variant="outline" size="lg" onClick={() => setContactOpen(true)}>
              {t('nav.contact')}
            </Button>
          </motion.div>
        </Container>
      </section>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* About Our Business */}
      <section className="py-20">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t('home.aboutUs')} title={introTitle} description={introText} />
          </FadeIn>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="bg-surface-muted py-20">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t('home.whyUs')} title={t('home.whyChooseUs')} />
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="border-border bg-surface flex flex-col items-center gap-3 rounded-2xl border p-6 text-center">
                <span className="bg-gold/10 text-gold flex h-11 w-11 items-center justify-center rounded-full">
                  <Icon size={20} />
                </span>
                <h3 className="text-sm font-semibold">{t(titleKey)}</h3>
                <p className="text-text-muted text-sm">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Services */}
      {!!serviceCategories?.length && (
        <section className="py-20">
          <Container>
            <FadeIn>
              <SectionHeading eyebrow={t('page.services.eyebrow')} title={t('home.ourServices')} linkTo="/services" />
            </FadeIn>

            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {serviceCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveServiceTab(cat.id)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide uppercase transition-colors',
                    (activeServiceCategory?.id ?? serviceCategories[0]?.id) === cat.id
                      ? 'bg-gold text-ink-black border-gold'
                      : 'border-border text-text-muted hover:border-gold hover:text-gold',
                  )}
                >
                  {tf(cat.name, cat.nameTe)}
                </button>
              ))}
            </div>

            {activeServiceCategory && (
              <div className="border-border bg-surface mt-8 rounded-2xl border p-6 sm:p-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{tf(activeServiceCategory.name, activeServiceCategory.nameTe)}</h3>
                  {activeServiceCategory.description && (
                    <p className="text-text-muted mx-auto mt-1 max-w-xl text-sm">
                      {tf(activeServiceCategory.description, activeServiceCategory.descriptionTe)}
                    </p>
                  )}
                </div>

                {activeServiceOptions.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeServiceOptions.map((opt) => (
                      <div key={opt.id} className="border-border bg-bg flex flex-col overflow-hidden rounded-xl border">
                        <ImageOrPlaceholder src={opt.imageUrl} alt={opt.name} className="h-28 w-full object-cover" />
                        <div className="flex flex-1 flex-col p-4">
                          <h4 className="text-sm font-semibold">{tf(opt.name, opt.nameTe)}</h4>
                          {opt.description && <p className="text-text-muted mt-1 text-sm">{opt.description}</p>}
                          <p className="text-gold mt-3 text-sm font-semibold">
                            ₹{Number(opt.price).toLocaleString('en-IN')}
                            {opt.unit === 'PER_GUEST' && <span className="text-text-muted text-sm"> {t('common.perGuest')}</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted mt-6 text-center text-sm">{t('home.noOptionsYet')}</p>
                )}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Packages */}
      {!!packages?.length && (
        <section className="bg-surface-muted py-20">
          <Container>
            <FadeIn>
              <SectionHeading eyebrow={t('home.curatedForYou')} title={t('nav.packages')} linkTo="/packages" />
            </FadeIn>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {packages.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="border-border bg-surface overflow-hidden rounded-2xl border">
                  <ImageOrPlaceholder src={pkg.imageUrl} alt={pkg.name} className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="font-semibold">{tf(pkg.name, pkg.nameTe)}</h3>
                    <p className="text-gold mt-1 text-sm font-semibold">
                      ₹{Number(pkg.pricePerGuest).toLocaleString('en-IN')} {t('common.perGuest')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Gallery */}
      {!!gallery?.length && (
        <section className="py-20">
          <Container>
            <FadeIn>
              <SectionHeading eyebrow={t('home.ourWork')} title={t('nav.gallery')} linkTo="/gallery" />
            </FadeIn>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {gallery.slice(0, 8).map((img) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={tf(img.caption ?? '', img.captionTe)}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Customer Reviews */}
      {!!testimonials?.length && (
        <section className="bg-surface-muted py-20">
          <Container>
            <FadeIn>
              <SectionHeading eyebrow={t('home.kindWords')} title={t('home.customerReviews')} linkTo="/testimonials" />
            </FadeIn>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {testimonials.slice(0, 3).map((item) => (
                <div key={item.id} className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < item.rating ? 'fill-gold text-gold' : 'text-border'} />
                    ))}
                  </div>
                  <p className="text-sm italic">&ldquo;{tf(item.message, item.messageTe)}&rdquo;</p>
                  <p className="text-sm font-semibold">{item.customerName}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      {!!faqs?.length && (
        <section className="py-20">
          <Container className="max-w-3xl">
            <FadeIn>
              <SectionHeading eyebrow={t('page.faq.eyebrow')} title={t('page.faq.title')} linkTo="/faq" />
            </FadeIn>
            <div className="border-border bg-surface mt-10 divide-y rounded-2xl border">
              {faqs.slice(0, 4).map((faq) => (
                <div key={faq.id} className="px-6 py-4">
                  <p className="text-sm font-semibold">{tf(faq.question, faq.questionTe)}</p>
                  <p className="text-text-muted mt-1 text-sm">{tf(faq.answer, faq.answerTe)}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Contact Information + Map */}
      <section className="bg-surface-muted py-20">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t('home.getInTouch')} title={t('home.contactInformation')} linkTo="/contact" />
          </FadeIn>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <a
                href={`tel:+91${phone}`}
                className="border-border bg-surface hover:border-gold flex items-center gap-3 rounded-2xl border p-5 transition-colors"
              >
                <span className="bg-gold/10 text-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-text-muted text-sm">{t('contact.callUs')}</p>
                  <p className="text-sm font-semibold">+91 {phone}</p>
                </div>
              </a>
              <a
                href={`mailto:${email}`}
                className="border-border bg-surface hover:border-gold flex items-center gap-3 rounded-2xl border p-5 transition-colors"
              >
                <span className="bg-gold/10 text-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-text-muted text-sm">{t('contact.emailUs')}</p>
                  <p className="text-sm font-semibold">{email}</p>
                </div>
              </a>
              <div className="border-border bg-surface flex items-center gap-3 rounded-2xl border p-5">
                <span className="bg-gold/10 text-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-text-muted text-sm">{t('contact.visitUs')}</p>
                  <p className="text-sm font-semibold">{address}</p>
                </div>
              </div>
            </div>
            <div className="border-gold/30 aspect-video w-full overflow-hidden rounded-2xl border lg:aspect-auto">
              <iframe
                title="Business location"
                src={mapEmbedUrl}
                className="h-full min-h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
