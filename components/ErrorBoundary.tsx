import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix for TS error: Property 'props' does not exist on type 'ErrorBoundary'
  public declare props: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
             <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            The application encountered an unexpected error. 
            {this.state.error?.message && <span className="block mt-2 font-mono text-xs bg-black/30 p-2 rounded text-red-300">{this.state.error.message}</span>}
          </p>
          <button
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            className="flex items-center gap-2 bg-electricBlue px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reset App & Reload
          </button>
          <p className="text-xs text-gray-600 mt-4">
              This will clear your local data to fix potential crashes.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;