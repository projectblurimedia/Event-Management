import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { PublicSidebar } from './PublicSidebar';
import { Logo } from './Logo';
import { Footer } from './Footer';
import { FloatingActions } from './FloatingActions';
import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export function PublicLayout() {
  useScrollToTop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <PublicSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-col">
        <div className="bg-header-bg text-header-text border-gold/20 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur lg:hidden">
          <Logo className="text-header-text" />
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-header-text flex h-9 w-9 items-center justify-center"
          >
            <Menu size={22} />
          </button>
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>

      <FloatingActions />
      <BackToTopButton side="left" />
    </div>
  );
}
