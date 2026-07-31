import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Award, Check, Clock, HeartHandshake, Mail, MapPin, Phone, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { LinkButton, Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder';
import { ContactModal } from '@/features/booking/ContactModal';
import { useSettings } from '@/lib/api/settings';
import { isVideoUrl } from '@/lib/cloudinary';
import {
  packageHooks,
  testimonialHooks,
  categoryHooks,
  categoryTypeHooks,
  itemHooks,
} from '@/lib/api/resources';
import { PageLoader } from '@/components/ui/PageLoader';
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
  const { data: testimonials } = testimonialHooks.usePublicList();
  const { data: categories } = categoryHooks.usePublicList();
  const { data: categoryTypes } = categoryTypeHooks.usePublicList();
  const { data: items } = itemHooks.usePublicList();
  const [contactOpen, setContactOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState<string | null>(null);

  const serviceCategories = categories?.filter((c) => !c.isFood) ?? [];
  const activeServiceCategory = serviceCategories.find((c) => c.id === activeServiceTab) ?? serviceCategories[0];
  const activeServiceCategoryTypeIds = new Set(
    categoryTypes?.filter((ty) => ty.categoryId === activeServiceCategory?.id).map((ty) => ty.id) ?? [],
  );
  const activeServiceItems = items?.filter((i) => activeServiceCategoryTypeIds.has(i.categoryTypeId)) ?? [];

  if (!settings) return <PageLoader />;

  const heroHeadline = tf(settings.heroHeadline, settings.heroHeadlineTe);
  const heroSubheadline = tf(settings.heroSubheadline, settings.heroSubheadlineTe);
  const introTitle = tf(settings.businessIntroTitle, settings.businessIntroTitleTe);
  const introText = tf(settings.businessIntroText, settings.businessIntroTextTe);

  const { phone, email, address, mapEmbedUrl, businessName, organiser } = settings;

  const heroContent = (
    <>
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-gold text-sm font-semibold tracking-[0.35em] uppercase"
      >
        {organiser} Presents
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
    </>
  );

  return (
    <>
      <Helmet>
        <title>{businessName} | Premium Event Management &amp; Catering</title>
        <meta
          name="description"
          content="Premium wedding planning, catering and event management for weddings, birthdays, housewarmings, engagements and corporate events."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EventPlanner',
            name: businessName,
            telephone: `+91${phone}`,
            email,
            address,
          })}
        </script>
      </Helmet>

      {/* Hero */}
      {settings.heroImageUrl ? (
        <section className="bg-[image:var(--gradient-luxury)] text-cream overflow-hidden">
          {isVideoUrl(settings.heroImageUrl) ? (
            <video
              src={settings.heroImageUrl}
              className="h-[45vh] w-full object-contain sm:h-[60vh]"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={settings.heroImageUrl} alt="" className="h-[45vh] w-full object-contain sm:h-[60vh]" />
          )}
          <Container className="flex flex-col items-center gap-6 py-16 text-center">{heroContent}</Container>
        </section>
      ) : (
        <section className="bg-[image:var(--gradient-luxury)] text-cream relative overflow-hidden">
          <div
            aria-hidden
            className="border-gold/30 pointer-events-none absolute inset-4 rounded-2xl border sm:inset-8"
          />
          <Container className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 py-24 text-center">
            {heroContent}
          </Container>
        </section>
      )}
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* About Our Business */}
      <section className="py-20">
        <Container>
          {settings.businessIntroImageUrl ? (
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <FadeIn>
                <ImageOrPlaceholder
                  src={settings.businessIntroImageUrl}
                  alt={introTitle}
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              </FadeIn>
              <FadeIn>
                <SectionHeading eyebrow={t('home.aboutUs')} title={introTitle} description={introText} align="left" />
              </FadeIn>
            </div>
          ) : (
            <FadeIn>
              <SectionHeading eyebrow={t('home.aboutUs')} title={introTitle} description={introText} />
            </FadeIn>
          )}
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
      {!!serviceCategories.length && (
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

                {activeServiceItems.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeServiceItems.map((item) => (
                      <div key={item.id} className="border-border bg-bg flex flex-col overflow-hidden rounded-xl border">
                        <ImageOrPlaceholder src={item.images[0] ?? null} alt={item.name} className="h-28 w-full object-cover" />
                        <div className="flex flex-1 flex-col p-4">
                          <h4 className="text-sm font-semibold">{tf(item.name, item.nameTe)}</h4>
                          {item.description && <p className="text-text-muted mt-1 text-sm">{item.description}</p>}
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
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {packages.slice(0, 3).map((pkg) => (
                <div
                  key={pkg.id}
                  className={cn(
                    'border-border bg-surface flex flex-col overflow-hidden rounded-2xl border',
                    pkg.isFeatured && 'border-gold shadow-xl shadow-gold/10 lg:-translate-y-3',
                  )}
                >
                  <ImageOrPlaceholder src={pkg.imageUrl} alt={pkg.name} className="h-40 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-6">
                    {pkg.isFeatured && (
                      <span className="bg-gold text-ink-black mb-2 w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                        {t('packages.mostPopular')}
                      </span>
                    )}
                    <h3 className="mt-1 text-lg font-semibold">{tf(pkg.name, pkg.nameTe)}</h3>
                    <ul className="mt-4 flex-1 space-y-2">
                      {pkg.categories.map((pc) => (
                        <li key={pc.id} className="flex items-start gap-2 text-sm">
                          <Check size={14} className="text-gold mt-0.5 shrink-0" />
                          {tf(pc.category.name, pc.category.nameTe)}
                        </li>
                      ))}
                    </ul>
                    <LinkButton
                      to={`/booking?package=${pkg.id}`}
                      variant={pkg.isFeatured ? 'gold' : 'outline'}
                      className="mt-5 w-full"
                    >
                      {t('packages.chooseThisPackage')}
                    </LinkButton>
                  </div>
                </div>
              ))}
              <div className="border-border bg-surface flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
                <span className="bg-rose/10 text-rose flex h-11 w-11 items-center justify-center rounded-full">
                  <Sparkles size={20} />
                </span>
                <h3 className="text-lg font-semibold">{t('wizard.customPackageTitle')}</h3>
                <p className="text-text-muted text-sm">{t('wizard.customPackageDesc')}</p>
                <LinkButton to="/booking?package=custom" variant="outline" className="mt-2 w-full">
                  {t('packages.chooseThisPackage')}
                </LinkButton>
              </div>
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

      {/* Contact Information + Map */}
      <section className="bg-surface-muted py-20">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t('home.getInTouch')} title={t('home.contactInformation')} linkTo="/contact" />
          </FadeIn>
          <div className={cn('mt-10 grid gap-10', mapEmbedUrl && 'lg:grid-cols-2')}>
            <div className={cn('grid gap-4 sm:grid-cols-3', mapEmbedUrl && 'lg:grid-cols-1')}>
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
            {mapEmbedUrl && (
              <div className="border-gold/30 aspect-video w-full overflow-hidden rounded-2xl border lg:aspect-auto">
                <iframe
                  title="Business location"
                  src={mapEmbedUrl}
                  className="h-full min-h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
