import { LogOut, Menu, Search, Shield, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import Footer from "./Footer.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/demo", label: "Demo Mode" },
  { to: "/analyze", label: "Analyze" },
  { to: "/history", label: "History" },
  { to: "/analytics", label: "Analytics" },
  { to: "/research-mode", label: "Research Mode" },
  { to: "/researcher-dashboard", label: "Researcher Dashboard" },
  { to: "/settings", label: "Settings" },
];

export default function AppShell({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-navy-950 text-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="rounded-lg bg-blue-600 p-2">
          <Shield size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-bold">SafeGuard AI</p>
          <p className="text-xs text-slate-300">Human-centered security</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          navigate("/demo");
          setOpen(false);
        }}
        className="mx-6 mb-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
      >
        <Search size={18} aria-hidden="true" />
        Launch demo
      </button>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-semibold ${
                isActive ? "bg-white text-navy-950" : "text-slate-300 hover:bg-navy-850 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-5">
        <p className="truncate text-sm font-semibold">{user?.email}</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-navy-850 hover:text-white"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1728_42%,#111827_100%)]">
      <div className="hidden fixed inset-y-0 left-0 z-20 lg:block">{sidebar}</div>

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 font-bold text-slate-950">
          <Shield size={20} className="text-blue-600" aria-hidden="true" />
          SafeGuard AI
        </div>
        <span className="w-10" />
      </header>

      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="absolute inset-y-0 left-0">
            {sidebar}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <main className="flex min-h-screen flex-col lg:pl-72">
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
