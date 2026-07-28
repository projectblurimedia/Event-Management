import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/cn';

interface BackToTopButtonProps {
  /** Which corner to anchor to — 'left' avoids colliding with the public site's Call/WhatsApp buttons (bottom-right). */
  side?: 'left' | 'right';
}

export function BackToTopButton({ side = 'right' }: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cn(
        'bg-surface text-gold border-border fixed bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg shadow-black/20 transition-transform hover:scale-105',
        side === 'left' ? 'left-5' : 'right-5',
      )}
    >
      <ArrowUp size={20} />
    </button>
  );
}
