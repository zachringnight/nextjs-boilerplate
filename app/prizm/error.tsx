'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PrizmError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          The app encountered an unexpected error. Try reloading the page.
        </p>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mb-6 p-3 bg-[#0D0D0D] rounded-lg overflow-auto text-left">
            <code className="text-red-400 text-xs font-mono break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FFD100] text-black font-medium rounded-lg hover:bg-[#FFD100]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/prizm"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2A2A2A] text-white font-medium rounded-lg hover:bg-[#3A3A3A] transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
