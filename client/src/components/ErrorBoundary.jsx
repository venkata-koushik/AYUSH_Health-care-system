import { Component } from "react";

// A render error in one page used to blank the whole app. This keeps the rest
// of the shell alive and gives the user a way back instead of a white screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Page failed to render:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-error">
        <div className="app-error-card">
          <h1>Something went wrong</h1>
          <p>
            This page could not be displayed. Your data is safe — please try
            again.
          </p>
          <div className="app-error-actions">
            <button type="button" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <a href="/">Back to home</a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
