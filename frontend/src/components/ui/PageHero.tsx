import { motion } from 'framer-motion';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="bg-[image:var(--gradient-luxury)] text-cream relative overflow-hidden py-20 text-center">
      <div
        aria-hidden
        className="border-gold/30 pointer-events-none absolute inset-4 rounded-2xl border sm:inset-8"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mx-auto flex max-w-2xl flex-col items-center gap-3 px-4"
      >
        <span className="text-gold text-xs font-semibold tracking-[0.35em] uppercase">{eyebrow}</span>
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="text-cream/70 text-balance">{description}</p>}
      </motion.div>
    </section>
  );
}
