import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingNavbar({ token }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-950/30">
            <ShieldCheck size={21} aria-hidden="true" />
          </span>
          <span className="truncate text-base font-bold text-white">SafeGuard AI</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to={token ? "/research-mode" : "/login"}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Research Mode
          </Link>
          <Link
            to="/professor-demo"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Professor Demo
          </Link>
          <Link
            to={token ? "/demo" : "/login"}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            {token ? "Try Demo" : "Sign in"}
          </Link>
          {token && (
            <Link
              to="/dashboard"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Dashboard
            </Link>
          )}
        </div>

        <Link
          to={token ? "/dashboard" : "/login"}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-navy-950 shadow-lg shadow-blue-950/20 transition hover:bg-blue-50 md:hidden"
        >
          {token ? "Open" : "Sign in"}
        </Link>
      </nav>
    </header>
  );
}
