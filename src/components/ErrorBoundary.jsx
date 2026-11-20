import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log the error - in production this could go to an error tracking service
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-ivory text-ink p-8">
          <h2 className="font-display text-2xl font-medium text-gold-deep mb-4">
            {this.state.error && this.state.error.message ? this.state.error.message : "Error"}
          </h2>
          <p className="text-ink/60 mb-8 max-w-xl text-center">
            {this.state.errorInfo
              ? "An unexpected error occurred while loading this page."
              : "Something went wrong. The page failed to render properly."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border border-gold/30 bg-[#fbf6ea] px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#f6ecd8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
            >
              Reload
            </button>
            <a
              href="/cities"
              className="rounded-full border border-gold/30 bg-[#fbf6ea] px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#f6ecd8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
            >
              Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;