import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check for timeout-related errors
    const isTimeout = error.message?.includes('timeout') || 
                     error.message?.includes('Timeout') ||
                     error.name === 'TimeoutError';
    
    return {
      hasError: true,
      errorMessage: isTimeout 
        ? 'Loading is taking longer than expected. The app will continue with backup data.'
        : error.message || 'An unexpected error occurred'
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log in development to reduce noise
    if (import.meta.env?.DEV || import.meta.env?.MODE === 'development') {
      console.warn('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // For timeout errors, automatically retry after a delay
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      setTimeout(() => {
        this.handleRetry();
      }, 2000);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      errorMessage: ''
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 text-center bg-red-50 border-red-200">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div>
              <h3 className="m-0 text-red-900 mb-2">Something went wrong</h3>
              <p className="text-sm text-red-700 m-0 mb-4">
                {this.state.errorMessage}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <p className="text-xs text-red-600">
                If this problem persists, the app will continue with backup data.
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}