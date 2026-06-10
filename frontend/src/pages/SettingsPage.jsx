import { LogOut, Server, UserRound } from "lucide-react";

export default function SettingsPage({ user, onLogout }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-white">Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <UserRound size={20} aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-slate-950">Account</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-950">{user?.email || "Signed in user"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Authentication</dt>
              <dd className="mt-1 text-slate-950">Local email and password</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onLogout}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Server size={20} aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-slate-950">Local deployment</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Backend</dt>
              <dd className="mt-1 font-mono text-slate-950">http://localhost:8000</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Frontend</dt>
              <dd className="mt-1 font-mono text-slate-950">http://localhost:5173</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Data</dt>
              <dd className="mt-1 text-slate-950">SQLite database in the backend folder</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
