import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

// Client errors (4xx) won't succeed on retry — only retry network drops,
// timeouts and server errors (5xx / no response), and only a couple of times.
function shouldRetry(failureCount: number, error: unknown) {
  if (isAxiosError(error) && error.response && error.response.status < 500) return false;
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
