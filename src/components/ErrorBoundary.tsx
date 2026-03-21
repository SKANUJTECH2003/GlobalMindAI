import { Component, ReactNode, ErrorInfo } from 'react';
import { logger } from '../services/logger';
import '../styles/ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents entire app from crashing
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorCount = this.state.errorCount + 1;
    
    this.setState({
      error,
      errorInfo,
      errorCount,
    });

    // Log error details
    logger.error('ErrorBoundary caught an error:', error);
    logger.debug('Error Info:', errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-reset after 5 errors (to prevent infinite loops)
    if (errorCount >= 5) {
      logger.warn('Too many errors detected, clearing error state in 10 seconds');
      this.resetTimeoutId = setTimeout(() => {
        this.resetError();
      }, 10000);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.arraysEqual(this.props.resetKeys, prevProps.resetKeys)
    ) {
      this.resetError();
    }
  }

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private arraysEqual(a: Array<string | number>, b: Array<string | number>): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-icon">💥</div>
            <h2>Oops! Something went wrong</h2>
            <p className="error-message">
              The app encountered an unexpected error. Don't worry, we've captured the details.
            </p>
            
            {import.meta.env.DEV && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button 
                className="reset-button"
                onClick={this.resetError}
              >
                Try Again
              </button>
              <button 
                className="reload-button"
                onClick={() => window.location.reload()}
              >
                Reload App
              </button>
            </div>

            <p className="error-count">
              Error count: {this.state.errorCount}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
