import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("SafeGuard AI page error", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="rounded-lg border border-white/10 bg-white/10 p-6 text-white shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Safe fallback</p>
        <h1 className="mt-2 text-2xl font-bold">This page could not render.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
          SafeGuard caught the page error instead of showing a blank screen. Return to the dashboard or try the page again.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/dashboard" className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Retry page
          </button>
        </div>
      </section>
    );
  }
}
