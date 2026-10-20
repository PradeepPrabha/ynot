import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null }
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('UI error:', error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <p className="font-serif text-5xl font-semibold text-cocoa">Oops</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold">Something went wrong on this page</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink/70">The page hit an unexpected problem. Your cart and wishlist are safe. Reload the page, or head back to the homepage.</p>
        <div className="mt-6 flex gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload page</button>
          <a className="btn btn-outline" href="/">Go to homepage</a>
        </div>
      </div>
    );
  }
}
