'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="bg-[#1A1A1A] border border-red-500/30 rounded-xl p-6 m-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Something went wrong</h3>
              {this.props.componentName && (
                <p className="text-[#9CA3AF] text-sm">
                  Error in {this.props.componentName}
                </p>
              )}
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mb-4 p-3 bg-[#0D0D0D] rounded-lg overflow-auto">
              <code className="text-red-400 text-xs font-mono">
                {this.state.error.message}
              </code>
            </div>
          )}

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg hover:bg-[#FFD100]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for station cards with minimal UI on error
export function StationErrorFallback({ stationName }: { stationName: string }) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 flex flex-col items-center justify-center min-h-[180px]">
      <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
      <p className="text-[#9CA3AF] text-sm text-center">
        {stationName} unavailable
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 text-[#FFD100] text-sm flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        Reload
      </button>
    </div>
  );
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary componentName={componentName}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
