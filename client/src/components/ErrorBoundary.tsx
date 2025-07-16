
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.sectionName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>Something went wrong in {this.props.sectionName}</AlertTitle>
          <AlertDescription>
            This section encountered an error, but other parts of the application should continue working normally.
            <button 
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
