"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center p-6 text-center text-white bg-navy/50 border border-white/10 rounded-2xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight text-white">
            Something went wrong
          </h2>
          <p className="mb-8 max-w-md text-sm text-gray-400">
            An unexpected error occurred in the application. Our team has been notified.
            Please try refreshing the page or navigating back.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 rounded-xl bg-electric px-6 py-3 font-mono text-sm font-bold tracking-wider text-navy transition-all hover:scale-105 active:scale-95"
            aria-label="Refresh page"
          >
            <RefreshCcw className="h-4 w-4" />
            RELOAD APP
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
