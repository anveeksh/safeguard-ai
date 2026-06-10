import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { api } from "../api/client.js";

export default function AuthPage({ onSession, token }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("demo@safeguard.ai");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = mode === "login" ? await api.login({ email, password }) : await api.register({ email, password });
      onSession(session);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <Link to="/" className="inline-flex items-center gap-3 text-slate-950">
          <span className="rounded-lg bg-blue-600 p-2 text-white">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold">SafeGuard AI</span>
        </Link>

        <div className="mt-8 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-950"
            />
          </label>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Working..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm leading-6 text-slate-500">
          Demo account is available after running the seed script: demo@safeguard.ai / demo1234.
        </p>
      </section>
    </div>
  );
}
