import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/router';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <OfflineBanner />
          <RouterProvider router={router} />
          <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
