import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
}

const getErrorMessage = (error: Error): string => {
  if (error.name === 'NetworkError') {
    return 'Unable to connect to the server. Please check your internet connection.';
  } else if (error.name === 'ValidationError') {
    return 'Invalid input data. Please check your input and try again.';
  } else if (error.name === 'AuthenticationError') {
    return 'Authentication failed. Please log in again.';
  }
  return error.message || 'An unexpected error occurred.';
};

const ErrorFallback = ({ error, errorInfo }: ErrorFallbackProps) => {
  const errorMessage = getErrorMessage(error);

  React.useEffect(() => {
    // Log error to Sentry with additional context
    Sentry.withScope((scope) => {
      scope.setExtra('errorInfo', errorInfo);
      Sentry.captureException(error);
    });
  }, [error, errorInfo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="mb-4 text-gray-600">{errorMessage}</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<Props, { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}
