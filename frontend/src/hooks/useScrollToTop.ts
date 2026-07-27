import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Client-side route changes don't reset scroll position like a full page
 * load would, so navigating to a new page can land mid-scroll from
 * wherever the previous page was left. Scroll back to the top whenever
 * the route (pathname) changes.
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
