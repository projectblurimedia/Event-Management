import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingActions } from './FloatingActions';
import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export function PublicLayout() {
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
      <BackToTopButton side="left" />
    </div>
  );
}
