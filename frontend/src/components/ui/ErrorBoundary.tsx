import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-bg text-text flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-text-muted max-w-sm text-sm">
            An unexpected error occurred while loading this page. Please reload — if this keeps happening, contact
            us directly.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-gold text-ink-black inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold hover:brightness-105"
          >
            <RefreshCw size={15} /> Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
