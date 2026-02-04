'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

function AppErrorFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Something went wrong
        </h2>

        <p className="text-[#9CA3AF] mb-6">
          The app encountered an unexpected error. This has been logged for review.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FFD100] text-black font-medium rounded-lg hover:bg-[#FFD100]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload App
          </button>

          <Link
            href="/prizm"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2A2A2A] text-white font-medium rounded-lg hover:bg-[#3A3A3A] transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        <p className="text-[#6B7280] text-sm mt-6">
          If this keeps happening, try clearing your browser cache.
        </p>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[App Error]', error);
      console.error('[Component Stack]', errorInfo.componentStack);
    }

    // In production, you would send this to an error tracking service like Sentry
    // Example:
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  };

  return (
    <ErrorBoundary
      fallback={<AppErrorFallback />}
      onError={handleError}
      componentName="App"
    >
      {children}
    </ErrorBoundary>
  );
}
